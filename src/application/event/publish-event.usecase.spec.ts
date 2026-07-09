import { NotFoundException } from '@nestjs/common';
import { PublishEventUseCase } from './publish-event.usecase';
import { InMemoryEventRepository } from '../testing/in-memory-event.repository';
import { EventAggregate } from '../../domain/event/event.aggregate';
import { DateRange } from '../../domain/event/date-range.vo';
import { Capacity } from '../../domain/event/capacity.vo';
import { EventNotPublishableError } from '../../domain/shared/domain-error';
import { EventDispatcherService } from '../../infrastructure/events/event-dispatcher.service';
import { EVENT_NAMES } from '../../infrastructure/events/event-names.constant';

function buildEvent(status: EventAggregate['status'] = 'DRAFT') {
  return EventAggregate.create({
    id: 'event-1',
    organizerId: 'organizer-1',
    name: 'Annual Conference',
    description: null,
    location: null,
    category: 'OTHER',
    passHash: null,
    dateRange: DateRange.create(
      new Date('2026-09-01T09:00:00.000Z'),
      new Date('2026-09-02T18:00:00.000Z'),
    ),
    capacity: Capacity.create(100),
    status,
  });
}

describe('PublishEventUseCase', () => {
  let eventRepository: InMemoryEventRepository;
  let dispatcher: { dispatch: jest.Mock };
  let useCase: PublishEventUseCase;

  beforeEach(() => {
    eventRepository = new InMemoryEventRepository();
    dispatcher = { dispatch: jest.fn() };
    useCase = new PublishEventUseCase(
      eventRepository,
      dispatcher as unknown as EventDispatcherService,
    );
  });

  it('publishes a DRAFT event and dispatches EVENT_PUBLISHED', async () => {
    const event = buildEvent();
    await eventRepository.save(event);

    const published = await useCase.execute({
      id: event.id,
      organizerId: event.organizerId,
    });

    expect(published.status).toBe('PUBLISHED');
    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      EVENT_NAMES.EVENT_PUBLISHED,
      expect.objectContaining({ eventId: event.id }),
    );
  });

  it('rejects publishing an event belonging to a different organizer', async () => {
    const event = buildEvent();
    await eventRepository.save(event);

    await expect(
      useCase.execute({ id: event.id, organizerId: 'someone-else' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects publishing an unknown event', async () => {
    await expect(
      useCase.execute({ id: 'unknown', organizerId: 'organizer-1' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects double-publishing an already PUBLISHED event', async () => {
    const event = buildEvent('PUBLISHED');
    await eventRepository.save(event);

    await expect(
      useCase.execute({ id: event.id, organizerId: event.organizerId }),
    ).rejects.toThrow(EventNotPublishableError);
  });
});
