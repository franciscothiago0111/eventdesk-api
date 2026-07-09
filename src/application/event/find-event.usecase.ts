import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EVENT_REPOSITORY } from '../../domain/event/event.repository';
import type { EventRepository } from '../../domain/event/event.repository';
import { EventAggregate } from '../../domain/event/event.aggregate';
import { EVENT_IMAGE_REPOSITORY } from '../../domain/event-image/event-image.repository';
import type { EventImageRepository } from '../../domain/event-image/event-image.repository';
import { EventImageAggregate } from '../../domain/event-image/event-image.aggregate';
import { SCHEDULE_ITEM_REPOSITORY } from '../../domain/schedule/schedule-item.repository';
import type { ScheduleItemRepository } from '../../domain/schedule/schedule-item.repository';
import { ScheduleItemAggregate } from '../../domain/schedule/schedule-item.aggregate';

export interface FindEventResult {
  event: EventAggregate;
  images: EventImageAggregate[];
  schedule: ScheduleItemAggregate[];
}

@Injectable()
export class FindEventUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    @Inject(EVENT_IMAGE_REPOSITORY)
    private readonly eventImageRepository: EventImageRepository,
    @Inject(SCHEDULE_ITEM_REPOSITORY)
    private readonly scheduleItemRepository: ScheduleItemRepository,
  ) {}

  async execute(params: {
    id: string;
    organizerId: string;
  }): Promise<FindEventResult> {
    const event = await this.eventRepository.findById(params.id);
    if (!event || event.organizerId !== params.organizerId) {
      throw new NotFoundException('Event not found');
    }

    const [images, schedule] = await Promise.all([
      this.eventImageRepository.findByEvent(event.id),
      this.scheduleItemRepository.findByEvent(event.id),
    ]);

    return { event, images, schedule };
  }
}
