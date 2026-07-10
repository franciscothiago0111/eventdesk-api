import { Inject, Injectable } from '@nestjs/common';
import { DASHBOARD_STATS_REPOSITORY } from '../../domain/dashboard/dashboard-stats.repository';
import type {
  DashboardStats,
  DashboardStatsRepository,
} from '../../domain/dashboard/dashboard-stats.repository';

export interface GetDashboardStatsParams {
  organizerId: string;
}

@Injectable()
export class GetDashboardStatsUseCase {
  constructor(
    @Inject(DASHBOARD_STATS_REPOSITORY)
    private readonly dashboardStatsRepository: DashboardStatsRepository,
  ) {}

  async execute(params: GetDashboardStatsParams): Promise<DashboardStats> {
    return this.dashboardStatsRepository.getStats(params.organizerId);
  }
}
