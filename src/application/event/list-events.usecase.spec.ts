import { ListEventsUseCase } from './list-events.usecase';
import { InMemoryEventRepository } from '../testing/in-memory-event.repository';
import { EventAggregate } from '../../domain/event/event.aggregate';
import { DateRange } from '../../domain/event/date-range.vo';
import { Capacity } from '../../domain/event/capacity.vo';

function buildEvent(
  id: string,
  organizerId: string,
  overrides: { name?: string; status?: EventAggregate['status'] } = {},
) {
  return EventAggregate.create({
    id,
    organizerId,
    name: overrides.name ?? 'Annual Conference',
    description: null,
    dateRange: DateRange.create(
      new Date('2026-09-01T09:00:00.000Z'),
      new Date('2026-09-02T18:00:00.000Z'),
    ),
    capacity: Capacity.create(100),
    status: overrides.status ?? 'DRAFT',
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

    const result = await useCase.execute({ organizerId: 'organizer-1' });

    expect(result.total).toBe(2);
    expect(result.data.map((event) => event.id).sort()).toEqual([
      'event-1',
      'event-2',
    ]);
  });

  it('returns an empty list when the organizer has no events', async () => {
    const result = await useCase.execute({ organizerId: 'organizer-1' });

    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('filters by name', async () => {
    await eventRepository.save(
      buildEvent('event-1', 'organizer-1', { name: 'Tech Summit' }),
    );
    await eventRepository.save(
      buildEvent('event-2', 'organizer-1', { name: 'Music Festival' }),
    );

    const result = await useCase.execute({
      organizerId: 'organizer-1',
      name: 'tech',
    });

    expect(result.data.map((event) => event.id)).toEqual(['event-1']);
  });

  it('filters by status', async () => {
    await eventRepository.save(
      buildEvent('event-1', 'organizer-1', { status: 'DRAFT' }),
    );
    await eventRepository.save(
      buildEvent('event-2', 'organizer-1', { status: 'PUBLISHED' }),
    );

    const result = await useCase.execute({
      organizerId: 'organizer-1',
      status: 'PUBLISHED',
    });

    expect(result.data.map((event) => event.id)).toEqual(['event-2']);
  });

  it('paginates results', async () => {
    for (let i = 1; i <= 3; i += 1) {
      await eventRepository.save(buildEvent(`event-${i}`, 'organizer-1'));
    }

    const result = await useCase.execute({
      organizerId: 'organizer-1',
      page: 2,
      limit: 2,
    });

    expect(result.total).toBe(3);
    expect(result.data).toHaveLength(1);
  });
});
