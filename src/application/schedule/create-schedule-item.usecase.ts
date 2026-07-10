import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EVENT_REPOSITORY } from '../../domain/event/event.repository';
import type { EventRepository } from '../../domain/event/event.repository';
import { SCHEDULE_ITEM_REPOSITORY } from '../../domain/schedule/schedule-item.repository';
import type { ScheduleItemRepository } from '../../domain/schedule/schedule-item.repository';
import { ScheduleItemAggregate } from '../../domain/schedule/schedule-item.aggregate';
import { DateRange } from '../../domain/event/date-range.vo';
import { ScheduleItemOutOfRangeError } from '../../domain/shared/domain-error';

export interface CreateScheduleItemParams {
  eventId: string;
  organizerId: string;
  title: string;
  description?: string | null;
  startTime: Date;
  endTime: Date;
}

@Injectable()
export class CreateScheduleItemUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    @Inject(SCHEDULE_ITEM_REPOSITORY)
    private readonly scheduleItemRepository: ScheduleItemRepository,
  ) {}

  async execute(
    params: CreateScheduleItemParams,
  ): Promise<ScheduleItemAggregate> {
    const event = await this.eventRepository.findById(params.eventId);
    if (!event || event.organizerId !== params.organizerId) {
      throw new NotFoundException('Event not found');
    }

    if (
      params.startTime < event.dateRange.startDate ||
      params.endTime > event.dateRange.endDate
    ) {
      throw new ScheduleItemOutOfRangeError(
        'Schedule item must be within the event dates',
      );
    }

    const item = ScheduleItemAggregate.create({
      id: randomUUID(),
      eventId: params.eventId,
      title: params.title,
      description: params.description ?? null,
      timeRange: DateRange.create(params.startTime, params.endTime),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.scheduleItemRepository.save(item);
    return item;
  }
}
