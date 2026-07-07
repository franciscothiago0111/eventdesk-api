import { EventAggregate, EventStatus } from './event.aggregate';

export interface EventListFilters {
  name?: string;
  status?: EventStatus;
  page?: number;
  limit?: number;
}

export interface EventListResult {
  data: EventAggregate[];
  total: number;
}

export interface EventRepository {
  save(event: EventAggregate): Promise<void>;
  findById(id: string): Promise<EventAggregate | null>;
  findByOrganizer(
    organizerId: string,
    filters?: EventListFilters,
  ): Promise<EventListResult>;
}

export const EVENT_REPOSITORY = Symbol('EVENT_REPOSITORY');
