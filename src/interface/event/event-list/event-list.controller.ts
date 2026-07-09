import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ListEventsUseCase } from '../../../application/event/list-events.usecase';
import { ApiResponseService } from '../../../shared/services/api-response.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { presentEvent } from '../event.presenter';
import { ListEventsDto } from './dto/list-events.dto';

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
  async list(
    @Query() query: ListEventsDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const { data, total } = await this.listEventsUseCase.execute({
      organizerId: user.organizerId,
      name: query.name,
      status: query.status,
      page,
      limit,
    });

    return this.apiResponse.paginated(
      'Events retrieved',
      data.map((event) => presentEvent(event)),
      total,
      page,
      limit,
    );
  }
}
