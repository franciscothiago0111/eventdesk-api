import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FindPublicEventUseCase } from '../../../application/event/find-public-event.usecase';
import { ApiResponseService } from '../../../shared/services/api-response.service';
import { Public } from '../../../shared/decorators/public.decorator';
import { presentPublicEvent } from '../event.presenter';

@ApiTags('public-events')
@Controller('public/events')
export class EventFindPublicController {
  constructor(
    private readonly findPublicEventUseCase: FindPublicEventUseCase,
    private readonly apiResponse: ApiResponseService,
  ) {}

  @Public()
  @Get(':id')
  async find(@Param('id') id: string) {
    const { event, images, schedule } =
      await this.findPublicEventUseCase.execute({ id });
    return this.apiResponse.success(
      'Event retrieved',
      presentPublicEvent(event, images, schedule),
    );
  }
}
