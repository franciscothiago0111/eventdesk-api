import { randomUUID } from 'crypto';
import { PrismaService } from './prisma.service';
import { PrismaEventRepository } from './event.repository';
import { PrismaRegistrationRepository } from './registration.repository';
import { PrismaCheckInRepository } from './check-in.repository';
import { EventAggregate } from '../../domain/event/event.aggregate';
import { RegistrationAggregate } from '../../domain/registration/registration.aggregate';
import { CheckInAggregate } from '../../domain/check-in/check-in.aggregate';
import { DateRange } from '../../domain/event/date-range.vo';
import { Capacity } from '../../domain/event/capacity.vo';

describe('PrismaCheckInRepository (integration)', () => {
  let prisma: PrismaService;
  let repository: PrismaCheckInRepository;
  let organizerId: string;
  let staffId: string;
  let eventId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repository = new PrismaCheckInRepository(prisma);

    const organizer = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: `checkin-repo-organizer-${randomUUID()}@eventdesk.test`,
        passwordHash: 'hash',
        name: 'Organizer',
        role: 'ORGANIZER',
      },
    });
    organizerId = organizer.id;

    const staff = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: `checkin-repo-staff-${randomUUID()}@eventdesk.test`,
        passwordHash: 'hash',
        name: 'Staff',
        role: 'STAFF',
      },
    });
    staffId = staff.id;

    const eventRepository = new PrismaEventRepository(prisma);
    const event = EventAggregate.create({
      id: randomUUID(),
      organizerId,
      name: 'Annual Conference',
      description: null,
      dateRange: DateRange.create(
        new Date('2026-09-01T09:00:00.000Z'),
        new Date('2026-09-02T18:00:00.000Z'),
      ),
      capacity: Capacity.create(50),
      status: 'PUBLISHED',
    });
    await eventRepository.save(event);
    eventId = event.id;
  });

  afterAll(async () => {
    await prisma.checkIn.deleteMany({
      where: { registration: { eventId } },
    });
    await prisma.registration.deleteMany({ where: { eventId } });
    await prisma.event.deleteMany({ where: { organizerId } });
    await prisma.user.deleteMany({
      where: { id: { in: [organizerId, staffId] } },
    });
    await prisma.$disconnect();
  });

  async function buildRegistration(): Promise<RegistrationAggregate> {
    const registrationRepository = new PrismaRegistrationRepository(prisma);
    const registration = RegistrationAggregate.confirm({
      id: randomUUID(),
      eventId,
      attendeeName: 'Jane Doe',
      attendeeEmail: `jane-${randomUUID()}@example.com`,
    });
    await registrationRepository.save(registration);
    return registration;
  }

  it('round-trips a check-in through save and existsForRegistration', async () => {
    const registration = await buildRegistration();
    const checkIn = CheckInAggregate.record({
      id: randomUUID(),
      registrationId: registration.id,
      checkedInById: staffId,
    });

    await repository.save(checkIn);
    const exists = await repository.existsForRegistration(registration.id);

    expect(exists).toBe(true);
  });

  it('existsForRegistration returns false when no check-in was recorded', async () => {
    const registration = await buildRegistration();

    const exists = await repository.existsForRegistration(registration.id);

    expect(exists).toBe(false);
  });

  it('countForEvent counts check-ins across the event registrations', async () => {
    const before = await repository.countForEvent(eventId);

    const registrationA = await buildRegistration();
    const registrationB = await buildRegistration();
    await repository.save(
      CheckInAggregate.record({
        id: randomUUID(),
        registrationId: registrationA.id,
        checkedInById: staffId,
      }),
    );
    await repository.save(
      CheckInAggregate.record({
        id: randomUUID(),
        registrationId: registrationB.id,
        checkedInById: staffId,
      }),
    );

    const after = await repository.countForEvent(eventId);

    expect(after - before).toBe(2);
  });
});
