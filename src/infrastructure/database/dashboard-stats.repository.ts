import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  DashboardStats,
  DashboardStatsRepository,
} from '../../domain/dashboard/dashboard-stats.repository';
import { EventCategory, EventStatus } from '../../domain/event/event.aggregate';

const EVENT_STATUSES: EventStatus[] = [
  'DRAFT',
  'PUBLISHED',
  'CLOSED',
  'CANCELLED',
];

const EVENT_CATEGORIES: EventCategory[] = [
  'CONFERENCE',
  'WORKSHOP',
  'MEETUP',
  'HACKATHON',
  'WEBINAR',
  'TRAINING',
  'OTHER',
];

@Injectable()
export class PrismaDashboardStatsRepository implements DashboardStatsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(organizerId: string): Promise<DashboardStats> {
    const [statusGroups, categoryGroups, eventAggregate, totalRegistered, totalCheckIns] =
      await Promise.all([
        this.prisma.event.groupBy({
          by: ['status'],
          where: { organizerId },
          _count: true,
        }),
        this.prisma.event.groupBy({
          by: ['category'],
          where: { organizerId },
          _count: true,
        }),
        this.prisma.event.aggregate({
          where: { organizerId },
          _count: true,
          _sum: { capacity: true },
        }),
        this.prisma.registration.count({
          where: { status: 'CONFIRMED', event: { organizerId } },
        }),
        this.prisma.checkIn.count({
          where: { registration: { event: { organizerId } } },
        }),
      ]);

    const eventsByStatus = EVENT_STATUSES.reduce(
      (acc, status) => {
        acc[status] =
          statusGroups.find((group) => group.status === status)?._count ?? 0;
        return acc;
      },
      {} as Record<EventStatus, number>,
    );

    const eventsByCategory = EVENT_CATEGORIES.reduce(
      (acc, category) => {
        acc[category] =
          categoryGroups.find((group) => group.category === category)
            ?._count ?? 0;
        return acc;
      },
      {} as Record<EventCategory, number>,
    );

    return {
      totalEvents: eventAggregate._count,
      totalCapacity: eventAggregate._sum.capacity ?? 0,
      totalRegistered,
      totalCheckIns,
      eventsByStatus,
      eventsByCategory,
    };
  }
}
