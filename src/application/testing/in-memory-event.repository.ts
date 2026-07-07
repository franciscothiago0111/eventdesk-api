import {
  EventListFilters,
  EventListResult,
  EventRepository,
} from '../../domain/event/event.repository';
import { EventAggregate } from '../../domain/event/event.aggregate';

export class InMemoryEventRepository implements EventRepository {
  private readonly events = new Map<string, EventAggregate>();

  save(event: EventAggregate): Promise<void> {
    this.events.set(event.id, event);
    return Promise.resolve();
  }

  findById(id: string): Promise<EventAggregate | null> {
    return Promise.resolve(this.events.get(id) ?? null);
  }

  findByOrganizer(
    organizerId: string,
    filters: EventListFilters = {},
  ): Promise<EventListResult> {
    const { name, status, page = 1, limit = 10 } = filters;

    const matches = [...this.events.values()].filter(
      (event) =>
        event.organizerId === organizerId &&
        (!name || event.name.toLowerCase().includes(name.toLowerCase())) &&
        (!status || event.status === status),
    );

    const start = (page - 1) * limit;
    return Promise.resolve({
      data: matches.slice(start, start + limit),
      total: matches.length,
    });
  }
}
