import { NotFoundException } from '@nestjs/common';
import { CloseEventUseCase } from './close-event.usecase';
import { InMemoryEventRepository } from '../testing/in-memory-event.repository';
import { EventAggregate } from '../../domain/event/event.aggregate';
import { DateRange } from '../../domain/event/date-range.vo';
import { Capacity } from '../../domain/event/capacity.vo';
import { EventNotPublishableError } from '../../domain/shared/domain-error';
import { EventDispatcherService } from '../../infrastructure/events/event-dispatcher.service';
import { EVENT_NAMES } from '../../infrastructure/events/event-names.constant';

function buildEvent(status: EventAggregate['status'] = 'PUBLISHED') {
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
    status,
  });
}

describe('CloseEventUseCase', () => {
  let eventRepository: InMemoryEventRepository;
  let dispatcher: { dispatch: jest.Mock };
  let useCase: CloseEventUseCase;

  beforeEach(() => {
    eventRepository = new InMemoryEventRepository();
    dispatcher = { dispatch: jest.fn() };
    useCase = new CloseEventUseCase(
      eventRepository,
      dispatcher as unknown as EventDispatcherService,
    );
  });

  it('closes a PUBLISHED event and dispatches EVENT_CLOSED', async () => {
    const event = buildEvent();
    await eventRepository.save(event);

    const closed = await useCase.execute({
      id: event.id,
      organizerId: event.organizerId,
    });

    expect(closed.status).toBe('CLOSED');
    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      EVENT_NAMES.EVENT_CLOSED,
      expect.objectContaining({ eventId: event.id }),
    );
  });

  it('rejects closing an event belonging to a different organizer', async () => {
    const event = buildEvent();
    await eventRepository.save(event);

    await expect(
      useCase.execute({ id: event.id, organizerId: 'someone-else' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects closing an unknown event', async () => {
    await expect(
      useCase.execute({ id: 'unknown', organizerId: 'organizer-1' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects closing a DRAFT event', async () => {
    const event = buildEvent('DRAFT');
    await eventRepository.save(event);

    await expect(
      useCase.execute({ id: event.id, organizerId: event.organizerId }),
    ).rejects.toThrow(EventNotPublishableError);
  });
});
