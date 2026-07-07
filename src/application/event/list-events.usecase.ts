import { Inject, Injectable } from '@nestjs/common';
import { EVENT_REPOSITORY } from '../../domain/event/event.repository';
import type {
  EventListResult,
  EventRepository,
} from '../../domain/event/event.repository';
import { EventStatus } from '../../domain/event/event.aggregate';

export interface ListEventsParams {
  organizerId: string;
  name?: string;
  status?: EventStatus;
  page?: number;
  limit?: number;
}

@Injectable()
export class ListEventsUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
  ) {}

  async execute(params: ListEventsParams): Promise<EventListResult> {
    const { organizerId, ...filters } = params;
    return this.eventRepository.findByOrganizer(organizerId, filters);
  }
}
