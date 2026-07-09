import { NotFoundException } from '@nestjs/common';
import { FindEventUseCase } from './find-event.usecase';
import { InMemoryEventRepository } from '../testing/in-memory-event.repository';
import { InMemoryEventImageRepository } from '../testing/in-memory-event-image.repository';
import { InMemoryScheduleItemRepository } from '../testing/in-memory-schedule-item.repository';
import { EventAggregate } from '../../domain/event/event.aggregate';
import { DateRange } from '../../domain/event/date-range.vo';
import { Capacity } from '../../domain/event/capacity.vo';

function buildEvent(organizerId: string) {
  return EventAggregate.create({
    id: 'event-1',
    organizerId,
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
    status: 'DRAFT',
  });
}

describe('FindEventUseCase', () => {
  let eventRepository: InMemoryEventRepository;
  let useCase: FindEventUseCase;

  beforeEach(() => {
    eventRepository = new InMemoryEventRepository();
    useCase = new FindEventUseCase(
      eventRepository,
      new InMemoryEventImageRepository(),
      new InMemoryScheduleItemRepository(),
    );
  });

  it('returns the event when it belongs to the organizer', async () => {
    const event = buildEvent('organizer-1');
    await eventRepository.save(event);

    const found = await useCase.execute({
      id: event.id,
      organizerId: 'organizer-1',
    });

    expect(found.event).toBe(event);
    expect(found.images).toEqual([]);
    expect(found.schedule).toEqual([]);
  });

  it('rejects finding an event belonging to a different organizer', async () => {
    const event = buildEvent('organizer-1');
    await eventRepository.save(event);

    await expect(
      useCase.execute({ id: event.id, organizerId: 'organizer-2' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects finding an unknown event', async () => {
    await expect(
      useCase.execute({ id: 'unknown', organizerId: 'organizer-1' }),
    ).rejects.toThrow(NotFoundException);
  });
});
