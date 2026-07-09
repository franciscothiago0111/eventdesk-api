import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ConfirmRegistrationUseCase } from './confirm-registration.usecase';
import { InMemoryEventRepository } from '../testing/in-memory-event.repository';
import { InMemoryRegistrationRepository } from '../testing/in-memory-registration.repository';
import { EventAggregate } from '../../domain/event/event.aggregate';
import { DateRange } from '../../domain/event/date-range.vo';
import { Capacity } from '../../domain/event/capacity.vo';
import {
  EventFullError,
  InvalidEventPassError,
} from '../../domain/shared/domain-error';
import { EventDispatcherService } from '../../infrastructure/events/event-dispatcher.service';
import { EVENT_NAMES } from '../../infrastructure/events/event-names.constant';

function buildEvent(
  capacity = 100,
  overrides: {
    status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'CANCELLED';
    passHash?: string | null;
  } = {},
) {
  return EventAggregate.create({
    id: 'event-1',
    organizerId: 'organizer-1',
    name: 'Annual Conference',
    description: null,
    location: null,
    category: 'OTHER',
    passHash: overrides.passHash ?? null,
    dateRange: DateRange.create(
      new Date('2026-09-01T09:00:00.000Z'),
      new Date('2026-09-02T18:00:00.000Z'),
    ),
    capacity: Capacity.create(capacity),
    status: overrides.status ?? 'PUBLISHED',
  });
}

describe('ConfirmRegistrationUseCase', () => {
  let eventRepository: InMemoryEventRepository;
  let registrationRepository: InMemoryRegistrationRepository;
  let dispatcher: { dispatch: jest.Mock };
  let useCase: ConfirmRegistrationUseCase;

  beforeEach(() => {
    eventRepository = new InMemoryEventRepository();
    registrationRepository = new InMemoryRegistrationRepository();
    dispatcher = { dispatch: jest.fn() };
    useCase = new ConfirmRegistrationUseCase(
      eventRepository,
      registrationRepository,
      dispatcher as unknown as EventDispatcherService,
    );
  });

  it('confirms a registration, reserves a slot, and dispatches REGISTRATION_CONFIRMED', async () => {
    const event = buildEvent();
    await eventRepository.save(event);

    const registration = await useCase.execute({
      eventId: event.id,
      organizerId: event.organizerId,
      attendeeName: 'Jane Doe',
      attendeeEmail: 'jane@example.com',
    });

    expect(registration.status).toBe('CONFIRMED');
    const savedEvent = await eventRepository.findById(event.id);
    expect(savedEvent?.capacity.current).toBe(1);
    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      EVENT_NAMES.REGISTRATION_CONFIRMED,
      expect.objectContaining({
        registrationId: registration.id,
        eventId: event.id,
      }),
    );
  });

  it('rejects registering for an event belonging to a different organizer', async () => {
    const event = buildEvent();
    await eventRepository.save(event);

    await expect(
      useCase.execute({
        eventId: event.id,
        organizerId: 'someone-else',
        attendeeName: 'Jane Doe',
        attendeeEmail: 'jane@example.com',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects registering for an unknown event', async () => {
    await expect(
      useCase.execute({
        eventId: 'unknown',
        organizerId: 'organizer-1',
        attendeeName: 'Jane Doe',
        attendeeEmail: 'jane@example.com',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects registering once the event is at capacity', async () => {
    const event = buildEvent(1);
    await eventRepository.save(event);

    await useCase.execute({
      eventId: event.id,
      organizerId: event.organizerId,
      attendeeName: 'Jane Doe',
      attendeeEmail: 'jane@example.com',
    });

    await expect(
      useCase.execute({
        eventId: event.id,
        organizerId: event.organizerId,
        attendeeName: 'John Doe',
        attendeeEmail: 'john@example.com',
      }),
    ).rejects.toThrow(EventFullError);
  });

  it('confirms a public registration for a published event without a pass', async () => {
    const event = buildEvent();
    await eventRepository.save(event);

    const registration = await useCase.execute({
      eventId: event.id,
      attendeeName: 'Jane Doe',
      attendeeEmail: 'jane@example.com',
    });

    expect(registration.status).toBe('CONFIRMED');
  });

  it('rejects a public registration for a non-published event', async () => {
    const event = buildEvent(100, { status: 'DRAFT' });
    await eventRepository.save(event);

    await expect(
      useCase.execute({
        eventId: event.id,
        attendeeName: 'Jane Doe',
        attendeeEmail: 'jane@example.com',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects a public registration missing the required pass', async () => {
    const passHash = await bcrypt.hash('secret-pass', 10);
    const event = buildEvent(100, { passHash });
    await eventRepository.save(event);

    await expect(
      useCase.execute({
        eventId: event.id,
        attendeeName: 'Jane Doe',
        attendeeEmail: 'jane@example.com',
      }),
    ).rejects.toThrow(InvalidEventPassError);
  });

  it('rejects a public registration with an incorrect pass', async () => {
    const passHash = await bcrypt.hash('secret-pass', 10);
    const event = buildEvent(100, { passHash });
    await eventRepository.save(event);

    await expect(
      useCase.execute({
        eventId: event.id,
        attendeeName: 'Jane Doe',
        attendeeEmail: 'jane@example.com',
        pass: 'wrong-pass',
      }),
    ).rejects.toThrow(InvalidEventPassError);
  });

  it('confirms a public registration with the correct pass', async () => {
    const passHash = await bcrypt.hash('secret-pass', 10);
    const event = buildEvent(100, { passHash });
    await eventRepository.save(event);

    const registration = await useCase.execute({
      eventId: event.id,
      attendeeName: 'Jane Doe',
      attendeeEmail: 'jane@example.com',
      pass: 'secret-pass',
    });

    expect(registration.status).toBe('CONFIRMED');
  });
});
