import { EventAggregate } from './event.aggregate';

export interface EventRepository {
  save(event: EventAggregate): Promise<void>;
  findById(id: string): Promise<EventAggregate | null>;
  findByOrganizer(organizerId: string): Promise<EventAggregate[]>;
}

export const EVENT_REPOSITORY = Symbol('EVENT_REPOSITORY');
