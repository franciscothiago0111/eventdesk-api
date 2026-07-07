import { Controller, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PublishEventUseCase } from '../../../application/event/publish-event.usecase';
import { ApiResponseService } from '../../../shared/services/api-response.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { presentEvent } from '../event.presenter';

@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
export class EventPublishController {
  constructor(
    private readonly publishEventUseCase: PublishEventUseCase,
    private readonly apiResponse: ApiResponseService,
  ) {}

  @Permissions('ORGANIZER')
  @Patch(':id/publish')
  async publish(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const event = await this.publishEventUseCase.execute({
      id,
      organizerId: user.organizerId,
    });
    return this.apiResponse.success('Event published', presentEvent(event));
  }
}
