import { randomUUID } from 'crypto';
import { PrismaService } from './prisma.service';
import { PrismaEventRepository } from './event.repository';
import { PrismaRegistrationRepository } from './registration.repository';
import { EventAggregate } from '../../domain/event/event.aggregate';
import { RegistrationAggregate } from '../../domain/registration/registration.aggregate';
import { DateRange } from '../../domain/event/date-range.vo';
import { Capacity } from '../../domain/event/capacity.vo';

describe('PrismaRegistrationRepository (integration)', () => {
  let prisma: PrismaService;
  let eventRepository: PrismaEventRepository;
  let repository: PrismaRegistrationRepository;
  let organizerId: string;
  let eventId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    eventRepository = new PrismaEventRepository(prisma);
    repository = new PrismaRegistrationRepository(prisma);

    const organizer = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: `registration-repo-${randomUUID()}@eventdesk.test`,
        passwordHash: 'hash',
        name: 'Organizer',
        role: 'ORGANIZER',
      },
    });
    organizerId = organizer.id;

    const event = EventAggregate.create({
      id: randomUUID(),
      organizerId,
      name: 'Annual Conference',
      description: null,
      location: null,
      profileImageUrl: null,
      coverImageUrl: null,
      passHash: null,
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
    await prisma.registration.deleteMany({ where: { eventId } });
    await prisma.event.deleteMany({ where: { organizerId } });
    await prisma.user.deleteMany({ where: { id: organizerId } });
    await prisma.$disconnect();
  });

  function buildRegistration(): RegistrationAggregate {
    return RegistrationAggregate.confirm({
      id: randomUUID(),
      eventId,
      attendeeName: 'Jane Doe',
      attendeeEmail: `jane-${randomUUID()}@example.com`,
    });
  }

  it('round-trips a registration through save and findById', async () => {
    const registration = buildRegistration();

    await repository.save(registration);
    const found = await repository.findById(registration.id);

    expect(found).not.toBeNull();
    expect(found?.id).toBe(registration.id);
    expect(found?.status).toBe('CONFIRMED');
    expect(found?.checkInCode.value).toBe(registration.checkInCode.value);
  });

  it('findByCheckInCode returns the matching registration', async () => {
    const registration = buildRegistration();
    await repository.save(registration);

    const found = await repository.findByCheckInCode(
      registration.checkInCode.value,
    );

    expect(found?.id).toBe(registration.id);
  });

  it('findByEvent returns only registrations for that event', async () => {
    const registration = buildRegistration();
    await repository.save(registration);

    const otherEvent = EventAggregate.create({
      id: randomUUID(),
      organizerId,
      name: 'Other Event',
      description: null,
      location: null,
      profileImageUrl: null,
      coverImageUrl: null,
      passHash: null,
      dateRange: DateRange.create(
        new Date('2026-09-01T09:00:00.000Z'),
        new Date('2026-09-02T18:00:00.000Z'),
      ),
      capacity: Capacity.create(10),
      status: 'PUBLISHED',
    });
    await eventRepository.save(otherEvent);
    const otherRegistration = RegistrationAggregate.confirm({
      id: randomUUID(),
      eventId: otherEvent.id,
      attendeeName: 'John Doe',
      attendeeEmail: `john-${randomUUID()}@example.com`,
    });
    await repository.save(otherRegistration);

    const found = await repository.findByEvent(eventId);

    expect(found.some((r) => r.id === registration.id)).toBe(true);
    expect(found.some((r) => r.id === otherRegistration.id)).toBe(false);

    await prisma.registration.deleteMany({ where: { eventId: otherEvent.id } });
    await prisma.event.delete({ where: { id: otherEvent.id } });
  });
});
