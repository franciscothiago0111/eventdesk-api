import {
  EventImageRepository,
} from '../../domain/event-image/event-image.repository';
import {
  EventImageAggregate,
  EventImageType,
} from '../../domain/event-image/event-image.aggregate';

export class InMemoryEventImageRepository implements EventImageRepository {
  private readonly images = new Map<string, EventImageAggregate>();

  save(image: EventImageAggregate): Promise<void> {
    this.images.set(image.id, image);
    return Promise.resolve();
  }

  findById(id: string): Promise<EventImageAggregate | null> {
    return Promise.resolve(this.images.get(id) ?? null);
  }

  findByEventAndType(
    eventId: string,
    type: EventImageType,
  ): Promise<EventImageAggregate | null> {
    const match = [...this.images.values()].find(
      (image) => image.eventId === eventId && image.type === type,
    );
    return Promise.resolve(match ?? null);
  }

  findByEvent(eventId: string): Promise<EventImageAggregate[]> {
    return Promise.resolve(
      [...this.images.values()].filter((image) => image.eventId === eventId),
    );
  }

  delete(id: string): Promise<void> {
    this.images.delete(id);
    return Promise.resolve();
  }
}
