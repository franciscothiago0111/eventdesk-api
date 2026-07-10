import { EventCategory, EventStatus } from '../event/event.aggregate';

export interface DashboardStats {
  totalEvents: number;
  totalCapacity: number;
  totalRegistered: number;
  totalCheckIns: number;
  eventsByStatus: Record<EventStatus, number>;
  eventsByCategory: Record<EventCategory, number>;
}

export interface DashboardStatsRepository {
  getStats(organizerId: string): Promise<DashboardStats>;
}

export const DASHBOARD_STATS_REPOSITORY = Symbol('DASHBOARD_STATS_REPOSITORY');
