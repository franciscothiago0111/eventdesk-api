import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetDashboardStatsUseCase } from '../../../application/dashboard/get-dashboard-stats.usecase';
import { ApiResponseService } from '../../../shared/services/api-response.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { presentDashboardStats } from '../dashboard.presenter';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardStatsController {
  constructor(
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
    private readonly apiResponse: ApiResponseService,
  ) {}

  @Permissions('ORGANIZER')
  @Get('stats')
  async getStats(@CurrentUser() user: CurrentUserPayload) {
    const stats = await this.getDashboardStatsUseCase.execute({
      organizerId: user.organizerId,
    });
    return this.apiResponse.success(
      'Dashboard stats retrieved',
      presentDashboardStats(stats),
    );
  }
}
