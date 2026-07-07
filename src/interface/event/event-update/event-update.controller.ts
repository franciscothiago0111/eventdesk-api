import { Body, Controller, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateEventUseCase } from '../../../application/event/update-event.usecase';
import { ApiResponseService } from '../../../shared/services/api-response.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../shared/decorators/current-user.decorator';
import { Permissions } from '../../../shared/decorators/permissions.decorator';
import { UpdateEventDto } from './dto/update-event.dto';
import { presentEvent } from '../event.presenter';

@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
export class EventUpdateController {
  constructor(
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly apiResponse: ApiResponseService,
  ) {}

  @Permissions('ORGANIZER')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const event = await this.updateEventUseCase.execute({
      id,
      organizerId: user.organizerId,
      name: dto.name,
      description: dto.description,
      location: dto.location,
      profileImageUrl: dto.profileImageUrl,
      coverImageUrl: dto.coverImageUrl,
      pass: dto.pass,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      capacity: dto.capacity,
    });
    return this.apiResponse.success('Event updated', presentEvent(event));
  }
}
