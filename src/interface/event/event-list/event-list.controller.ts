import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ListEventsUseCase } from '../../../application/event/list-events.usecase';
import { ApiResponseService } from '../../../shared/services/api-response.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { presentEvent } from '../event.presenter';

@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
export class EventListController {
  constructor(
    private readonly listEventsUseCase: ListEventsUseCase,
    private readonly apiResponse: ApiResponseService,
  ) {}

  @Permissions('ORGANIZER')
  @Get()
  async list(@CurrentUser() user: CurrentUserPayload) {
    const events = await this.listEventsUseCase.execute({
      organizerId: user.organizerId,
    });
    return this.apiResponse.success(
      'Events retrieved',
      events.map(presentEvent),
    );
  }
}
