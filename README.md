# eventdesk-api

Backend for eventdesk — event management with offline-capable, real-time attendee check-in. Built with NestJS, Prisma (Postgres), Redis/BullMQ, Socket.io, MinIO (S3-compatible object storage), and Resend (email).

Pairs with [eventdesk-web](https://github.com/franciscothiago0111/eventdesk-web) (Next.js).

## Architecture

Layered/DDD-ish structure, one folder per concern under `src/`:

```
src/
├── domain/            # Aggregates, value objects, domain events, repository/port interfaces — no framework/Prisma imports
│   ├── event/           EventAggregate, DateRange, Capacity
│   ├── registration/     RegistrationAggregate, CheckInCode
│   ├── check-in/         CheckInAggregate
│   ├── event-image/      EventImageAggregate
│   ├── notification/     Notification aggregate
│   ├── schedule/         Schedule item aggregate
│   ├── dashboard/        Read-model interfaces for aggregate stats
│   └── shared/           Cross-cutting ports (StoragePort, EmailPort)
├── application/        # Use-cases: orchestrate aggregates + repositories, one class per action
│   ├── auth/ event/ registration/ check-in/ event-image/ notification/ schedule/ dashboard/
│   └── testing/         in-memory fake repositories shared by application unit tests
├── infrastructure/     # Everything that talks to the outside world
│   ├── database/         PrismaService + Prisma implementations of the domain repository interfaces
│   ├── guards/            JwtAuthGuard, PermissionsGuard (role-based, @Permissions() decorator)
│   ├── strategies/        Passport JWT strategy
│   ├── events/            EventDispatcherService + listeners (audit log, email enqueue, websocket push)
│   ├── queue/             BullMQ module (email queue)
│   ├── storage/           StorageModule — MinioAdapter implementing StoragePort (event image uploads)
│   ├── email/             EmailModule — ResendAdapter implementing EmailPort + EmailTemplateService
│   ├── websocket/         Socket.io gateway, room-per-event
│   └── filters/           DomainErrorFilter — maps domain-layer errors to 400 responses
├── interface/           # HTTP surface: controllers + DTOs, one module per resource
│   ├── auth/ event/ registration/ check-in/ event-image/ notification/ schedule/ dashboard/
└── shared/              # Cross-cutting: ApiResponseService envelope, decorators, enums
```

Request flow: `interface` (controller, validates DTO) → `application` (use-case, loads/mutates an aggregate via a repository interface) → `domain` (aggregate enforces invariants, raises domain events) → `infrastructure` (Prisma repository persists, `EventDispatcherService` fans the domain event out to listeners: audit log, BullMQ job, websocket emit).

## Architecture Decision Records

### ADR 1 — the domain layer never imports Prisma

`src/domain/**` has zero imports of `@prisma/client` or any NestJS module. Aggregates (`EventAggregate`, `RegistrationAggregate`, `CheckInAggregate`) and value objects (`DateRange`, `Capacity`, `CheckInCode`) are plain TypeScript classes that enforce business invariants (capacity limits, date ranges, no double-publish, no duplicate check-in) and expose only repository *interfaces* (`EventRepository`, etc.), not implementations.

**Why:** domain unit tests run with no database and no Nest test module — just `new EventAggregate(...)` and assertions — which is why they're fast enough to run on every save and don't need Docker up. It also means swapping Prisma for another persistence layer only touches `infrastructure/database/*.repository.ts`, not business logic. The cost is an extra mapping step (Prisma row ↔ aggregate) in each infrastructure repository, which is intentional friction: it keeps ORM-shaped concerns (nullable columns, relations) out of the rules that decide whether an event can be published.

### ADR 2 — capacity is derived, not stored

`Event.capacity.current` is not a column. The Prisma `EventRepository` computes it as a filtered `_count` of `CONFIRMED` registrations at read time (`infrastructure/database/event.repository.ts`).

**Why:** a stored counter can drift from reality if a write to `Registration` ever fails to also update the counter (no DB transaction wraps `confirm()`/`cancel()` and the capacity check in this MVP — see the Phase 4 note in `docs/build-plan.md`). Deriving it removes the drift risk entirely at the cost of one extra aggregate query per event read, which is acceptable at MVP scale.

### ADR 3 — MVP auth is access-token-only

There is no refresh token. `JWT_EXPIRES_IN` (`.env`) controls the single access token's lifetime.

**Why:** keeps the auth slice small for the MVP cut; refresh-token rotation is a known, deliberate gap (not a silent shortcut) tracked for post-MVP.

## API docs (Swagger)

With the app running, interactive OpenAPI docs are served at:

```
http://localhost:3001/docs
```

Generated from `main.ts`'s `DocumentBuilder` — all controllers are annotated with `@nestjs/swagger` decorators, and the bearer-token auth scheme is pre-wired (use the "Authorize" button with a token from `POST /auth/login`).

## Getting started

### Prerequisites
- Node.js + Yarn
- Docker (for Postgres + Redis + MinIO)

### 1. Environment

```bash
cp .env.example .env
```

`.env.example` documents `DATABASE_URL`, `REDIS_HOST`/`REDIS_PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, the `MINIO_*` object storage settings, and `RESEND_API_KEY`/`EMAIL_FROM`. Defaults point at the ports below — no edits needed for local dev (the `RESEND_API_KEY` is blank by default; leave it blank in dev and the email adapter no-ops).

### 2. Infra

```bash
docker compose up -d
```

Brings up:
- **Postgres 16** on `localhost:5434` (container `eventdesk-postgres`) — deliberately not 5432, to avoid clashing with other projects already running on this machine.
- **Redis 7** on `localhost:6380` (container `eventdesk-redis`), backing the BullMQ email queue.
- **MinIO** on `localhost:9002` (API) / `localhost:9003` (console), container `eventdesk-minio` — S3-compatible object storage backing event image uploads (`StoragePort` / `MinioAdapter`).

### 3. Install, migrate, run

```bash
yarn install
npx prisma migrate deploy   # or `migrate dev` in local development
yarn start:dev
```

API listens on `http://localhost:3001`. Swagger at `http://localhost:3001/docs`.

## Compile and run the project

```bash
# development (watch mode)
$ yarn start:dev

# production mode
$ yarn build && yarn start:prod
```

## Testing

- `yarn test` — unit tests (`*.spec.ts`), covering the domain layer (aggregates and value objects in `src/domain`) and the application layer (use-cases in `src/application`, exercised against in-memory fake repositories rather than mocks).
- `yarn test:e2e` — end-to-end tests (`test/*.e2e-spec.ts`) that boot the full Nest app and hit its HTTP API against the real database.
- `yarn test:integration` — integration tests (`src/infrastructure/database/*.integration-spec.ts`) that exercise the Prisma repositories directly against Postgres. Requires `docker compose up -d` first.
- `yarn test:cov` — unit test coverage report. Current baseline: **23.06%** statements (21.25% branches, 29.36% functions, 23.39% lines) — coverage dropped as `event-image`, `notification`, `schedule`, and `dashboard` modules were added without unit tests yet.

Run everything CI runs, locally:

```bash
yarn lint && yarn build && yarn test && yarn test:integration && yarn test:e2e
```

## Key domain flows

- **Event lifecycle:** `DRAFT → PUBLISHED → CLOSED`, one-way, enforced by `EventAggregate` (double-publish, publish-after-close, etc. all raise domain errors → HTTP 400 via `DomainErrorFilter`).
- **Registration → check-in:** confirming a registration reserves a capacity slot and generates a `CheckInCode`; recording a check-in against an already-checked-in registration is rejected (400); a batch **sync-offline-check-ins** endpoint resolves a whole offline queue in one call with per-item outcomes (`recorded / duplicate / not_found / not_confirmed`), so a mobile client with a spotty connection doesn't lose a batch to one bad item.
- **Realtime:** check-ins are pushed over Socket.io to a room scoped to the event (`join-event`), consumed by `eventdesk-web`'s live dashboard.
- **Event images:** uploads go through `EventImageModule` → `StoragePort` (MinIO in dev/prod), decoupled from persistence so the object store can be swapped without touching the domain layer.
- **Notifications:** domain events (e.g. new registration, check-in) fan out via `EventDispatcherService` to a BullMQ-backed email queue (`EmailPort` / `ResendAdapter`) and to in-app `Notification` records surfaced by `NotificationModule`.
- **Schedule:** per-event schedule items (`ScheduleModule`) let organizers publish an agenda alongside the event.
- **Dashboard:** `DashboardModule` exposes aggregate stats (registrations, check-ins, capacity) computed at read time, not stored.

## Tech stack

NestJS · Prisma 7 (Postgres) · Redis + BullMQ · Socket.io · MinIO (S3-compatible storage via `@aws-sdk/client-s3`) · Resend (email) · Passport JWT · class-validator · Jest + Supertest · `@nestjs/swagger`

## License

MIT
# eventdesk-api
