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

interface PublicEventPayload {
  id: string;
  requiresPass: boolean;
}

interface RegistrationPayload {
  id: string;
  status: string;
}

describe('Public event registration (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  const email = `organizer-public-${Date.now()}@eventdesk.test`;
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
    await prisma.registration.deleteMany({
      where: { event: { organizer: { email } } },
    });
    await prisma.event.deleteMany({ where: { organizer: { email } } });
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  async function createEvent(overrides: Record<string, unknown> = {}) {
    const response = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Public Meetup',
        location: 'Remote',
        startDate: '2026-10-01T09:00:00.000Z',
        endDate: '2026-10-01T18:00:00.000Z',
        capacity: 10,
        ...overrides,
      })
      .expect(201);
    return (response.body as Envelope<EventPayload>).payload.id;
  }

  it('hides a DRAFT event from the public endpoint', async () => {
    const eventId = await createEvent();

    await request(app.getHttpServer())
      .get(`/public/events/${eventId}`)
      .expect(404);
  });

  it('exposes a PUBLISHED event and never leaks the pass hash', async () => {
    const eventId = await createEvent();
    await request(app.getHttpServer())
      .patch(`/events/${eventId}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .get(`/public/events/${eventId}`)
      .expect(200);
    const payload = (response.body as Envelope<PublicEventPayload>).payload;

    expect(payload.id).toBe(eventId);
    expect(payload.requiresPass).toBe(false);
    expect(payload).not.toHaveProperty('passHash');
    expect(payload).not.toHaveProperty('organizerId');
  });

  it('allows public registration without a pass when none is set', async () => {
    const eventId = await createEvent();
    await request(app.getHttpServer())
      .patch(`/events/${eventId}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .post(`/public/events/${eventId}/registrations`)
      .send({ attendeeName: 'Jane Doe', attendeeEmail: 'jane@example.com' })
      .expect(201);
    const registration = (response.body as Envelope<RegistrationPayload>)
      .payload;

    expect(registration.status).toBe('CONFIRMED');
  });

  it('rejects public registration with a missing or wrong pass, and confirms with the correct one', async () => {
    const eventId = await createEvent({ pass: 'let-me-in' });
    await request(app.getHttpServer())
      .patch(`/events/${eventId}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const publicEventResponse = await request(app.getHttpServer())
      .get(`/public/events/${eventId}`)
      .expect(200);
    expect(
      (publicEventResponse.body as Envelope<PublicEventPayload>).payload
        .requiresPass,
    ).toBe(true);

    await request(app.getHttpServer())
      .post(`/public/events/${eventId}/registrations`)
      .send({ attendeeName: 'Jane Doe', attendeeEmail: 'jane@example.com' })
      .expect(400);

    await request(app.getHttpServer())
      .post(`/public/events/${eventId}/registrations`)
      .send({
        attendeeName: 'Jane Doe',
        attendeeEmail: 'jane@example.com',
        pass: 'wrong-pass',
      })
      .expect(400);

    const response = await request(app.getHttpServer())
      .post(`/public/events/${eventId}/registrations`)
      .send({
        attendeeName: 'Jane Doe',
        attendeeEmail: 'jane@example.com',
        pass: 'let-me-in',
      })
      .expect(201);
    const registration = (response.body as Envelope<RegistrationPayload>)
      .payload;

    expect(registration.status).toBe('CONFIRMED');
  });
});
