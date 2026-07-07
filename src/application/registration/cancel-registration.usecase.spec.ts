import { NotFoundException } from '@nestjs/common';
import { CancelRegistrationUseCase } from './cancel-registration.usecase';
import { InMemoryEventRepository } from '../testing/in-memory-event.repository';
import { InMemoryRegistrationRepository } from '../testing/in-memory-registration.repository';
import { EventAggregate } from '../../domain/event/event.aggregate';
import { RegistrationAggregate } from '../../domain/registration/registration.aggregate';
import { DateRange } from '../../domain/event/date-range.vo';
import { Capacity } from '../../domain/event/capacity.vo';
import { EventDispatcherService } from '../../infrastructure/events/event-dispatcher.service';
import { EVENT_NAMES } from '../../infrastructure/events/event-names.constant';

function buildEvent(capacity = 10, current = 1) {
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
    capacity: Capacity.create(capacity, current),
    status: 'PUBLISHED',
  });
}

function buildRegistration(eventId: string) {
  return RegistrationAggregate.confirm({
    id: 'reg-1',
    eventId,
    attendeeName: 'Jane Doe',
    attendeeEmail: 'jane@example.com',
  });
}

describe('CancelRegistrationUseCase', () => {
  let eventRepository: InMemoryEventRepository;
  let registrationRepository: InMemoryRegistrationRepository;
  let dispatcher: { dispatch: jest.Mock };
  let useCase: CancelRegistrationUseCase;

  beforeEach(() => {
    eventRepository = new InMemoryEventRepository();
    registrationRepository = new InMemoryRegistrationRepository();
    dispatcher = { dispatch: jest.fn() };
    useCase = new CancelRegistrationUseCase(
      eventRepository,
      registrationRepository,
      dispatcher as unknown as EventDispatcherService,
    );
  });

  it('cancels a registration, releases the capacity slot, and dispatches REGISTRATION_CANCELLED', async () => {
    const event = buildEvent();
    const registration = buildRegistration(event.id);
    await eventRepository.save(event);
    await registrationRepository.save(registration);

    const cancelled = await useCase.execute({
      id: registration.id,
      organizerId: event.organizerId,
    });

    expect(cancelled.status).toBe('CANCELLED');
    const savedEvent = await eventRepository.findById(event.id);
    expect(savedEvent?.capacity.current).toBe(0);
    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      EVENT_NAMES.REGISTRATION_CANCELLED,
      expect.objectContaining({ registrationId: registration.id }),
    );
  });

  it('rejects cancelling an unknown registration', async () => {
    await expect(
      useCase.execute({ id: 'unknown', organizerId: 'organizer-1' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects cancelling a registration belonging to a different organizer', async () => {
    const event = buildEvent();
    const registration = buildRegistration(event.id);
    await eventRepository.save(event);
    await registrationRepository.save(registration);

    await expect(
      useCase.execute({ id: registration.id, organizerId: 'someone-else' }),
    ).rejects.toThrow(NotFoundException);
  });
});
