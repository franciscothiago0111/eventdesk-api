import { DashboardStats } from '../../domain/dashboard/dashboard-stats.repository';

export function presentDashboardStats(stats: DashboardStats) {
  return {
    totalEvents: stats.totalEvents,
    totalCapacity: stats.totalCapacity,
    totalRegistered: stats.totalRegistered,
    totalCheckIns: stats.totalCheckIns,
    eventsByStatus: stats.eventsByStatus,
    eventsByCategory: stats.eventsByCategory,
  };
}
