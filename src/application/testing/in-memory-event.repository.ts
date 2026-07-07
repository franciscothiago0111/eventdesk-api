import { EventRepository } from '../../domain/event/event.repository';
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

  findByOrganizer(organizerId: string): Promise<EventAggregate[]> {
    return Promise.resolve(
      [...this.events.values()].filter(
        (event) => event.organizerId === organizerId,
      ),
    );
  }
}
