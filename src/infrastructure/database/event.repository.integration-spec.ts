import { randomUUID } from 'crypto';
import { PrismaService } from './prisma.service';
import { PrismaEventRepository } from './event.repository';
import { PrismaRegistrationRepository } from './registration.repository';
import { EventAggregate } from '../../domain/event/event.aggregate';
import { RegistrationAggregate } from '../../domain/registration/registration.aggregate';
import { DateRange } from '../../domain/event/date-range.vo';
import { Capacity } from '../../domain/event/capacity.vo';

describe('PrismaEventRepository (integration)', () => {
  let prisma: PrismaService;
  let repository: PrismaEventRepository;
  let registrationRepository: PrismaRegistrationRepository;
  let organizerId: string;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
    repository = new PrismaEventRepository(prisma);
    registrationRepository = new PrismaRegistrationRepository(prisma);

    const organizer = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: `event-repo-${randomUUID()}@eventdesk.test`,
        passwordHash: 'hash',
        name: 'Organizer',
        role: 'ORGANIZER',
      },
    });
    organizerId = organizer.id;
  });

  afterAll(async () => {
    await prisma.registration.deleteMany({
      where: { event: { organizerId } },
    });
    await prisma.event.deleteMany({ where: { organizerId } });
    await prisma.user.deleteMany({ where: { id: organizerId } });
    await prisma.$disconnect();
  });

  function buildEvent(props: { id: string; capacity: number }): EventAggregate {
    return EventAggregate.create({
      id: props.id,
      organizerId,
      name: 'Annual Conference',
      description: 'A yearly gathering',
      dateRange: DateRange.create(
        new Date('2026-09-01T09:00:00.000Z'),
        new Date('2026-09-02T18:00:00.000Z'),
      ),
      capacity: Capacity.create(props.capacity),
      status: 'DRAFT',
    });
  }

  it('round-trips an event through save and findById', async () => {
    const event = buildEvent({ id: randomUUID(), capacity: 10 });

    await repository.save(event);
    const found = await repository.findById(event.id);

    expect(found).not.toBeNull();
    expect(found?.id).toBe(event.id);
    expect(found?.name).toBe('Annual Conference');
    expect(found?.capacity.max).toBe(10);
    expect(found?.status).toBe('DRAFT');
  });

  it('findByOrganizer returns only events for that organizer', async () => {
    const otherOrganizer = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: `event-repo-other-${randomUUID()}@eventdesk.test`,
        passwordHash: 'hash',
        name: 'Other Organizer',
        role: 'ORGANIZER',
      },
    });

    const mine = buildEvent({ id: randomUUID(), capacity: 5 });
    await repository.save(mine);
    const other = EventAggregate.create({
      id: randomUUID(),
      organizerId: otherOrganizer.id,
      name: 'Someone Else Event',
      description: null,
      dateRange: DateRange.create(
        new Date('2026-09-01T09:00:00.000Z'),
        new Date('2026-09-02T18:00:00.000Z'),
      ),
      capacity: Capacity.create(5),
      status: 'DRAFT',
    });
    await repository.save(other);

    const found = await repository.findByOrganizer(organizerId);

    expect(found.some((event) => event.id === mine.id)).toBe(true);
    expect(found.some((event) => event.id === other.id)).toBe(false);

    await prisma.event.deleteMany({
      where: { organizerId: otherOrganizer.id },
    });
    await prisma.user.delete({ where: { id: otherOrganizer.id } });
  });

  it('derives capacity.current from confirmed registrations only', async () => {
    const event = buildEvent({ id: randomUUID(), capacity: 5 });
    await repository.save(event);

    const confirmed = RegistrationAggregate.confirm({
      id: randomUUID(),
      eventId: event.id,
      attendeeName: 'Jane Doe',
      attendeeEmail: `jane-${randomUUID()}@example.com`,
    });
    await registrationRepository.save(confirmed);

    const cancelled = RegistrationAggregate.confirm({
      id: randomUUID(),
      eventId: event.id,
      attendeeName: 'John Doe',
      attendeeEmail: `john-${randomUUID()}@example.com`,
    });
    cancelled.cancel();
    await registrationRepository.save(cancelled);

    const found = await repository.findById(event.id);

    expect(found?.capacity.current).toBe(1);
  });
});
