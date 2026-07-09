import { EventImageAggregate, EventImageType } from './event-image.aggregate';

export interface EventImageRepository {
  save(image: EventImageAggregate): Promise<void>;
  findById(id: string): Promise<EventImageAggregate | null>;
  findByEventAndType(
    eventId: string,
    type: EventImageType,
  ): Promise<EventImageAggregate | null>;
  findByEvent(eventId: string): Promise<EventImageAggregate[]>;
  delete(id: string): Promise<void>;
}

export const EVENT_IMAGE_REPOSITORY = Symbol('EVENT_IMAGE_REPOSITORY');
