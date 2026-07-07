import { Inject, Injectable } from '@nestjs/common';
import { EVENT_REPOSITORY } from '../../domain/event/event.repository';
import type { EventRepository } from '../../domain/event/event.repository';
import { EventAggregate } from '../../domain/event/event.aggregate';

@Injectable()
export class ListEventsUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
  ) {}

  async execute(params: { organizerId: string }): Promise<EventAggregate[]> {
    return this.eventRepository.findByOrganizer(params.organizerId);
  }
}
