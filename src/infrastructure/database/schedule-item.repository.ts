import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ScheduleItemRepository } from '../../domain/schedule/schedule-item.repository';
import { ScheduleItemAggregate } from '../../domain/schedule/schedule-item.aggregate';
import { DateRange } from '../../domain/event/date-range.vo';
import { ScheduleItem as PrismaScheduleItem } from '../../generated/prisma/client';

@Injectable()
export class PrismaScheduleItemRepository implements ScheduleItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(item: ScheduleItemAggregate): Promise<void> {
    await this.prisma.scheduleItem.upsert({
      where: { id: item.id },
      create: {
        id: item.id,
        eventId: item.eventId,
        title: item.title,
        description: item.description,
        startTime: item.startTime,
        endTime: item.endTime,
      },
      update: {
        title: item.title,
        description: item.description,
        startTime: item.startTime,
        endTime: item.endTime,
      },
    });
  }

  async findById(id: string): Promise<ScheduleItemAggregate | null> {
    const item = await this.prisma.scheduleItem.findUnique({ where: { id } });
    return item ? this.toDomain(item) : null;
  }

  async findByEvent(eventId: string): Promise<ScheduleItemAggregate[]> {
    const items = await this.prisma.scheduleItem.findMany({
      where: { eventId },
      orderBy: { startTime: 'asc' },
    });
    return items.map((item) => this.toDomain(item));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.scheduleItem.delete({ where: { id } });
  }

  private toDomain(item: PrismaScheduleItem): ScheduleItemAggregate {
    return ScheduleItemAggregate.create({
      id: item.id,
      eventId: item.eventId,
      title: item.title,
      description: item.description,
      timeRange: DateRange.create(item.startTime, item.endTime),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  }
}
