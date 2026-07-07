import { NotFoundException } from '@nestjs/common';
import { ListRegistrationsByEventUseCase } from './list-registrations-by-event.usecase';
import { InMemoryEventRepository } from '../testing/in-memory-event.repository';
import { InMemoryRegistrationRepository } from '../testing/in-memory-registration.repository';
import { EventAggregate } from '../../domain/event/event.aggregate';
import { RegistrationAggregate } from '../../domain/registration/registration.aggregate';
import { DateRange } from '../../domain/event/date-range.vo';
import { Capacity } from '../../domain/event/capacity.vo';

function buildEvent() {
  return EventAggregate.create({
    id: 'event-1',
    organizerId: 'organizer-1',
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
    capacity: Capacity.create(100),
    status: 'PUBLISHED',
  });
}

describe('ListRegistrationsByEventUseCase', () => {
  let eventRepository: InMemoryEventRepository;
  let registrationRepository: InMemoryRegistrationRepository;
  let useCase: ListRegistrationsByEventUseCase;

  beforeEach(() => {
    eventRepository = new InMemoryEventRepository();
    registrationRepository = new InMemoryRegistrationRepository();
    useCase = new ListRegistrationsByEventUseCase(
      eventRepository,
      registrationRepository,
    );
  });

  it('returns registrations for the given event', async () => {
    const event = buildEvent();
    await eventRepository.save(event);
    const registration = RegistrationAggregate.confirm({
      id: 'reg-1',
      eventId: event.id,
      attendeeName: 'Jane Doe',
      attendeeEmail: 'jane@example.com',
    });
    await registrationRepository.save(registration);
    await registrationRepository.save(
      RegistrationAggregate.confirm({
        id: 'reg-2',
        eventId: 'other-event',
        attendeeName: 'John Doe',
        attendeeEmail: 'john@example.com',
      }),
    );

    const registrations = await useCase.execute({
      eventId: event.id,
      organizerId: event.organizerId,
    });

    expect(registrations.map((r) => r.id)).toEqual([registration.id]);
  });

  it('rejects listing registrations for an event belonging to a different organizer', async () => {
    const event = buildEvent();
    await eventRepository.save(event);

    await expect(
      useCase.execute({ eventId: event.id, organizerId: 'someone-else' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects listing registrations for an unknown event', async () => {
    await expect(
      useCase.execute({ eventId: 'unknown', organizerId: 'organizer-1' }),
    ).rejects.toThrow(NotFoundException);
  });
});
