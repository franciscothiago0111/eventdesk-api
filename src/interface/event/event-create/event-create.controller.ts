import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateEventUseCase } from '../../../application/event/create-event.usecase';
import { ApiResponseService } from '../../../shared/services/api-response.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { CreateEventDto } from './dto/create-event.dto';
import { presentEvent } from '../event.presenter';

@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
export class EventCreateController {
  constructor(
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly apiResponse: ApiResponseService,
  ) {}

  @Permissions('ORGANIZER')
  @Post()
  async create(
    @Body() dto: CreateEventDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const event = await this.createEventUseCase.execute({
      organizerId: user.organizerId,
      name: dto.name,
      description: dto.description,
      location: dto.location,
      category: dto.category,
      pass: dto.pass,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      capacity: dto.capacity,
    });
    return this.apiResponse.success('Event created', presentEvent(event));
  }
}
