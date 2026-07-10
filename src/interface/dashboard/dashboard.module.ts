import { Module } from '@nestjs/common';
import { DashboardStatsController } from './dashboard-stats/dashboard-stats.controller';
import { GetDashboardStatsUseCase } from '../../application/dashboard/get-dashboard-stats.usecase';
import { DASHBOARD_STATS_REPOSITORY } from '../../domain/dashboard/dashboard-stats.repository';
import { PrismaDashboardStatsRepository } from '../../infrastructure/database/dashboard-stats.repository';
import { ApiResponseService } from '../../shared/services/api-response.service';

@Module({
  controllers: [DashboardStatsController],
  providers: [
    GetDashboardStatsUseCase,
    ApiResponseService,
    {
      provide: DASHBOARD_STATS_REPOSITORY,
      useClass: PrismaDashboardStatsRepository,
    },
  ],
})
export class DashboardModule {}
