import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from './prisma.service';
import {
  EventListFilters,
  EventListResult,
  EventRepository,
} from '../../domain/event/event.repository';
import { EventAggregate } from '../../domain/event/event.aggregate';
import { DateRange } from '../../domain/event/date-range.vo';
import { Capacity } from '../../domain/event/capacity.vo';
import { Event as PrismaEvent } from '../../../generated/prisma/client';

@Injectable()
export class PrismaEventRepository implements EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(event: EventAggregate): Promise<void> {
    await this.prisma.event.upsert({
      where: { id: event.id },
      create: {
        id: event.id,
        organizerId: event.organizerId,
        name: event.name,
        description: event.description,
        location: event.location,
        category: event.category,
        passHash: event.passHash,
        startDate: event.dateRange.startDate,
        endDate: event.dateRange.endDate,
        capacity: event.capacity.max,
        status: event.status,
      },
      update: {
        name: event.name,
        description: event.description,
        location: event.location,
        category: event.category,
        passHash: event.passHash,
        startDate: event.dateRange.startDate,
        endDate: event.dateRange.endDate,
        capacity: event.capacity.max,
        status: event.status,
      },
    });
  }

  async findById(id: string): Promise<EventAggregate | null> {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: { registrations: { where: { status: 'CONFIRMED' } } },
        },
      },
    });
    if (!event) return null;
    return this.toDomain(event, event._count.registrations);
  }

  async findByOrganizer(
    organizerId: string,
    filters: EventListFilters = {},
  ): Promise<EventListResult> {
    const { name, status, page = 1, limit = 10 } = filters;

    const where: Prisma.EventWhereInput = {
      organizerId,
      ...(name ? { name: { contains: name, mode: 'insensitive' } } : {}),
      ...(status ? { status } : {}),
    };

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        include: {
          _count: {
            select: { registrations: { where: { status: 'CONFIRMED' } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events.map((event) =>
        this.toDomain(event, event._count.registrations),
      ),
      total,
    };
  }

  private toDomain(
    event: PrismaEvent,
    confirmedRegistrations: number,
  ): EventAggregate {
    return EventAggregate.create({
      id: event.id,
      organizerId: event.organizerId,
      name: event.name,
      description: event.description,
      location: event.location,
      category: event.category,
      passHash: event.passHash,
      dateRange: DateRange.create(event.startDate, event.endDate),
      capacity: Capacity.create(event.capacity, confirmedRegistrations),
      status: event.status,
    });
  }
}
