import { NotFoundException } from '@nestjs/common';
import { FindPublicEventUseCase } from './find-public-event.usecase';
import { InMemoryEventRepository } from '../testing/in-memory-event.repository';
import {
  EventAggregate,
  EventStatus,
} from '../../domain/event/event.aggregate';
import { DateRange } from '../../domain/event/date-range.vo';
import { Capacity } from '../../domain/event/capacity.vo';

function buildEvent(status: EventStatus) {
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

describe('FindPublicEventUseCase', () => {
  let eventRepository: InMemoryEventRepository;
  let useCase: FindPublicEventUseCase;

  beforeEach(() => {
    eventRepository = new InMemoryEventRepository();
    useCase = new FindPublicEventUseCase(eventRepository);
  });

  it('returns a published event', async () => {
    const event = buildEvent('PUBLISHED');
    await eventRepository.save(event);

    const found = await useCase.execute({ id: event.id });

    expect(found).toBe(event);
  });

  it.each(['DRAFT', 'CLOSED', 'CANCELLED'] as EventStatus[])(
    'rejects finding a %s event',
    async (status) => {
      const event = buildEvent(status);
      await eventRepository.save(event);

      await expect(useCase.execute({ id: event.id })).rejects.toThrow(
        NotFoundException,
      );
    },
  );

  it('rejects finding an unknown event', async () => {
    await expect(useCase.execute({ id: 'unknown' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
