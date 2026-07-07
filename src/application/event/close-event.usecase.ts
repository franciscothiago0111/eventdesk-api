import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EVENT_REPOSITORY } from '../../domain/event/event.repository';
import type { EventRepository } from '../../domain/event/event.repository';
import { EventAggregate } from '../../domain/event/event.aggregate';
import { EventClosed } from '../../domain/event/events/event-closed.event';
import { EventDispatcherService } from '../../infrastructure/events/event-dispatcher.service';
import { EVENT_NAMES } from '../../infrastructure/events/event-names.constant';

@Injectable()
export class CloseEventUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    private readonly dispatcher: EventDispatcherService,
  ) {}

  async execute(params: {
    id: string;
    organizerId: string;
  }): Promise<EventAggregate> {
    const event = await this.eventRepository.findById(params.id);
    if (!event || event.organizerId !== params.organizerId) {
      throw new NotFoundException('Event not found');
    }

    event.close();
    await this.eventRepository.save(event);

    this.dispatcher.dispatch(
      EVENT_NAMES.EVENT_CLOSED,
      new EventClosed(event.id, event.organizerId),
    );

    return event;
  }
}
