import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EVENT_REPOSITORY } from '../../domain/event/event.repository';
import type { EventRepository } from '../../domain/event/event.repository';
import { EventAggregate } from '../../domain/event/event.aggregate';

@Injectable()
export class FindEventUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
  ) {}

  async execute(params: {
    id: string;
    organizerId: string;
  }): Promise<EventAggregate> {
    const event = await this.eventRepository.findById(params.id);
    if (!event || event.organizerId !== params.organizerId) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }
}
