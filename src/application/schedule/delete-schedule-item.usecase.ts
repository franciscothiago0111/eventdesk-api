import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EVENT_REPOSITORY } from '../../domain/event/event.repository';
import type { EventRepository } from '../../domain/event/event.repository';
import { SCHEDULE_ITEM_REPOSITORY } from '../../domain/schedule/schedule-item.repository';
import type { ScheduleItemRepository } from '../../domain/schedule/schedule-item.repository';

@Injectable()
export class DeleteScheduleItemUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    @Inject(SCHEDULE_ITEM_REPOSITORY)
    private readonly scheduleItemRepository: ScheduleItemRepository,
  ) {}

  async execute(params: {
    id: string;
    eventId: string;
    organizerId: string;
  }): Promise<void> {
    const event = await this.eventRepository.findById(params.eventId);
    if (!event || event.organizerId !== params.organizerId) {
      throw new NotFoundException('Event not found');
    }

    const item = await this.scheduleItemRepository.findById(params.id);
    if (!item || item.eventId !== params.eventId) {
      throw new NotFoundException('Schedule item not found');
    }

    await this.scheduleItemRepository.delete(item.id);
  }
}
