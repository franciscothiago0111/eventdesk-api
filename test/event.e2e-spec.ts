import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/infrastructure/database/prisma.service';

interface Envelope<T> {
  success: boolean;
  message: string;
  payload: T;
}

interface EventPayload {
  id: string;
  status: string;
}

describe('Event (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  const email = `organizer-${Date.now()}@eventdesk.test`;
  const password = 'password123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = moduleFixture.get(PrismaService);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Organizer', email, password })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    accessToken = (loginResponse.body as Envelope<{ accessToken: string }>)
      .payload.accessToken;
  });

  afterAll(async () => {
    await prisma.event.deleteMany({ where: { organizer: { email } } });
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('creates, publishes, and closes an event', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Annual Conference',
        description: 'A yearly gathering',
        startDate: '2026-09-01T09:00:00.000Z',
        endDate: '2026-09-02T18:00:00.000Z',
        capacity: 100,
      })
      .expect(201);

    const created = createResponse.body as Envelope<EventPayload>;
    const eventId = created.payload.id;
    expect(created.payload.status).toBe('DRAFT');

    const findResponse = await request(app.getHttpServer())
      .get(`/events/${eventId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect((findResponse.body as Envelope<EventPayload>).payload.status).toBe(
      'DRAFT',
    );

    const publishResponse = await request(app.getHttpServer())
      .patch(`/events/${eventId}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(
      (publishResponse.body as Envelope<EventPayload>).payload.status,
    ).toBe('PUBLISHED');

    // Publishing again violates the DRAFT -> PUBLISHED invariant.
    await request(app.getHttpServer())
      .patch(`/events/${eventId}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);

    const closeResponse = await request(app.getHttpServer())
      .patch(`/events/${eventId}/close`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect((closeResponse.body as Envelope<EventPayload>).payload.status).toBe(
      'CLOSED',
    );

    const listResponse = await request(app.getHttpServer())
      .get('/events')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const list = (listResponse.body as Envelope<EventPayload[]>).payload;
    expect(list.some((e) => e.id === eventId)).toBe(true);
  });

  it('rejects requests without a bearer token', async () => {
    await request(app.getHttpServer()).get('/events').expect(401);
  });
});
