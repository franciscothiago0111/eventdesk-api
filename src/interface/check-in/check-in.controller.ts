import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RecordCheckInUseCase } from '../../application/check-in/record-check-in.usecase';
import { SyncOfflineCheckInsUseCase } from '../../application/check-in/sync-offline-check-ins.usecase';
import { ApiResponseService } from '../../shared/services/api-response.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../shared/decorators/current-user.decorator';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { RecordCheckInDto } from './dto/record-check-in.dto';
import { SyncOfflineCheckInsDto } from './dto/sync-offline-check-ins.dto';
import { presentCheckIn } from './check-in.presenter';

@ApiTags('check-ins')
@ApiBearerAuth()
@Controller('check-ins')
export class CheckInController {
  constructor(
    private readonly recordCheckInUseCase: RecordCheckInUseCase,
    private readonly syncOfflineCheckInsUseCase: SyncOfflineCheckInsUseCase,
    private readonly apiResponse: ApiResponseService,
  ) {}

  @Permissions('ORGANIZER')
  @Post()
  async record(
    @Body() dto: RecordCheckInDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const checkIn = await this.recordCheckInUseCase.execute({
      checkInCode: dto.checkInCode,
      checkedInById: user.id,
    });
    return this.apiResponse.success(
      'Attendee checked in',
      presentCheckIn(checkIn),
    );
  }

  @Permissions('ORGANIZER')
  @Post('sync-offline')
  async syncOffline(
    @Body() dto: SyncOfflineCheckInsDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const results = await this.syncOfflineCheckInsUseCase.execute({
      checkedInById: user.id,
      items: dto.items,
    });
    return this.apiResponse.success('Offline check-ins synced', results);
  }
}
