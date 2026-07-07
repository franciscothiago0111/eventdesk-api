import { Controller, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CloseEventUseCase } from '../../../application/event/close-event.usecase';
import { ApiResponseService } from '../../../shared/services/api-response.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { presentEvent } from '../event.presenter';

@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
export class EventCloseController {
  constructor(
    private readonly closeEventUseCase: CloseEventUseCase,
    private readonly apiResponse: ApiResponseService,
  ) {}

  @Permissions('ORGANIZER')
  @Patch(':id/close')
  async close(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const event = await this.closeEventUseCase.execute({
      id,
      organizerId: user.organizerId,
    });
    return this.apiResponse.success('Event closed', presentEvent(event));
  }
}
