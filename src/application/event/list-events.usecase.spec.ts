import { ListEventsUseCase } from './list-events.usecase';
import { InMemoryEventRepository } from '../testing/in-memory-event.repository';
import { EventAggregate } from '../../domain/event/event.aggregate';
import { DateRange } from '../../domain/event/date-range.vo';
import { Capacity } from '../../domain/event/capacity.vo';

function buildEvent(id: string, organizerId: string) {
  return EventAggregate.create({
    id,
    organizerId,
    name: 'Annual Conference',
    description: null,
    dateRange: DateRange.create(
      new Date('2026-09-01T09:00:00.000Z'),
      new Date('2026-09-02T18:00:00.000Z'),
    ),
    capacity: Capacity.create(100),
    status: 'DRAFT',
  });
}

describe('ListEventsUseCase', () => {
  let eventRepository: InMemoryEventRepository;
  let useCase: ListEventsUseCase;

  beforeEach(() => {
    eventRepository = new InMemoryEventRepository();
    useCase = new ListEventsUseCase(eventRepository);
  });

  it('returns only events belonging to the given organizer', async () => {
    await eventRepository.save(buildEvent('event-1', 'organizer-1'));
    await eventRepository.save(buildEvent('event-2', 'organizer-1'));
    await eventRepository.save(buildEvent('event-3', 'organizer-2'));

    const events = await useCase.execute({ organizerId: 'organizer-1' });

    expect(events.map((event) => event.id).sort()).toEqual([
      'event-1',
      'event-2',
    ]);
  });

  it('returns an empty list when the organizer has no events', async () => {
    const events = await useCase.execute({ organizerId: 'organizer-1' });

    expect(events).toEqual([]);
  });
});
