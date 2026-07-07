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

interface RegistrationPayload {
  id: string;
  eventId: string;
  checkInCode: string;
  status: string;
}

interface CheckInPayload {
  id: string;
  registrationId: string;
}

describe('Registration + CheckIn (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;
  const email = `organizer-checkin-${Date.now()}@eventdesk.test`;
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
    await prisma.checkIn.deleteMany({
      where: { registration: { event: { organizer: { email } } } },
    });
    await prisma.registration.deleteMany({
      where: { event: { organizer: { email } } },
    });
    await prisma.event.deleteMany({ where: { organizer: { email } } });
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it('registers, confirms, checks in, and rejects a duplicate check-in', async () => {
    const eventResponse = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Meetup',
        startDate: '2026-10-01T09:00:00.000Z',
        endDate: '2026-10-01T18:00:00.000Z',
        capacity: 1,
      })
      .expect(201);
    const eventId = (eventResponse.body as Envelope<EventPayload>).payload.id;

    await request(app.getHttpServer())
      .patch(`/events/${eventId}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const registrationResponse = await request(app.getHttpServer())
      .post(`/events/${eventId}/registrations`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ attendeeName: 'Jane Doe', attendeeEmail: 'jane@example.com' })
      .expect(201);
    const registration = (
      registrationResponse.body as Envelope<RegistrationPayload>
    ).payload;
    expect(registration.status).toBe('CONFIRMED');

    // Capacity is 1 and already taken, so a second registration must be rejected.
    await request(app.getHttpServer())
      .post(`/events/${eventId}/registrations`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ attendeeName: 'John Doe', attendeeEmail: 'john@example.com' })
      .expect(400);

    const checkInResponse = await request(app.getHttpServer())
      .post('/check-ins')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ checkInCode: registration.checkInCode })
      .expect(201);
    const checkIn = (checkInResponse.body as Envelope<CheckInPayload>).payload;
    expect(checkIn.registrationId).toBe(registration.id);

    // Same check-in code again must be rejected as a duplicate.
    await request(app.getHttpServer())
      .post('/check-ins')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ checkInCode: registration.checkInCode })
      .expect(400);

    const listResponse = await request(app.getHttpServer())
      .get(`/events/${eventId}/registrations`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const list = (listResponse.body as Envelope<RegistrationPayload[]>).payload;
    expect(list.some((r) => r.id === registration.id)).toBe(true);
  });

  it('sync-offline-check-ins resolves duplicates and unknown codes without throwing', async () => {
    const eventResponse = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Offline Sync Event',
        startDate: '2026-11-01T09:00:00.000Z',
        endDate: '2026-11-01T18:00:00.000Z',
        capacity: 5,
      })
      .expect(201);
    const eventId = (eventResponse.body as Envelope<EventPayload>).payload.id;

    await request(app.getHttpServer())
      .patch(`/events/${eventId}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const registrationResponse = await request(app.getHttpServer())
      .post(`/events/${eventId}/registrations`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        attendeeName: 'Offline Attendee',
        attendeeEmail: 'offline@example.com',
      })
      .expect(201);
    const registration = (
      registrationResponse.body as Envelope<RegistrationPayload>
    ).payload;

    const syncResponse = await request(app.getHttpServer())
      .post('/check-ins/sync-offline')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        items: [
          { checkInCode: registration.checkInCode },
          { checkInCode: registration.checkInCode },
          { checkInCode: 'UNKNOWNCODE1' },
        ],
      })
      .expect(201);

    const results = (
      syncResponse.body as Envelope<{ checkInCode: string; status: string }[]>
    ).payload;
    expect(results[0].status).toBe('recorded');
    expect(results[1].status).toBe('duplicate');
    expect(results[2].status).toBe('not_found');
  });
});
