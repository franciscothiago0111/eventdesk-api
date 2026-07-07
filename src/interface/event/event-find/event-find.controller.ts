import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FindEventUseCase } from '../../../application/event/find-event.usecase';
import { ApiResponseService } from '../../../shared/services/api-response.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { presentEvent } from '../event.presenter';

@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
export class EventFindController {
  constructor(
    private readonly findEventUseCase: FindEventUseCase,
    private readonly apiResponse: ApiResponseService,
  ) {}

  @Permissions('ORGANIZER')
  @Get(':id')
  async find(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    const event = await this.findEventUseCase.execute({
      id,
      organizerId: user.organizerId,
    });
    return this.apiResponse.success('Event retrieved', presentEvent(event));
  }
}
