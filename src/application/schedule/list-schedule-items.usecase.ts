import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EVENT_REPOSITORY } from '../../domain/event/event.repository';
import type { EventRepository } from '../../domain/event/event.repository';
import { SCHEDULE_ITEM_REPOSITORY } from '../../domain/schedule/schedule-item.repository';
import type { ScheduleItemRepository } from '../../domain/schedule/schedule-item.repository';
import { ScheduleItemAggregate } from '../../domain/schedule/schedule-item.aggregate';

@Injectable()
export class ListScheduleItemsUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    @Inject(SCHEDULE_ITEM_REPOSITORY)
    private readonly scheduleItemRepository: ScheduleItemRepository,
  ) {}

  async execute(params: {
    eventId: string;
    organizerId: string;
  }): Promise<ScheduleItemAggregate[]> {
    const event = await this.eventRepository.findById(params.eventId);
    if (!event || event.organizerId !== params.organizerId) {
      throw new NotFoundException('Event not found');
    }

    return this.scheduleItemRepository.findByEvent(params.eventId);
  }
}
