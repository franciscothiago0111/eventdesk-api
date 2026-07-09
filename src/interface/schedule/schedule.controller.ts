import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateScheduleItemUseCase } from '../../application/schedule/create-schedule-item.usecase';
import { UpdateScheduleItemUseCase } from '../../application/schedule/update-schedule-item.usecase';
import { DeleteScheduleItemUseCase } from '../../application/schedule/delete-schedule-item.usecase';
import { ListScheduleItemsUseCase } from '../../application/schedule/list-schedule-items.usecase';
import { ApiResponseService } from '../../shared/services/api-response.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../shared/decorators/current-user.decorator';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { CreateScheduleItemDto } from './dto/create-schedule-item.dto';
import { UpdateScheduleItemDto } from './dto/update-schedule-item.dto';
import { presentScheduleItem } from './schedule.presenter';

@ApiTags('events')
@ApiBearerAuth()
@Controller('events/:eventId/schedule')
export class ScheduleController {
  constructor(
    private readonly createScheduleItemUseCase: CreateScheduleItemUseCase,
    private readonly updateScheduleItemUseCase: UpdateScheduleItemUseCase,
    private readonly deleteScheduleItemUseCase: DeleteScheduleItemUseCase,
    private readonly listScheduleItemsUseCase: ListScheduleItemsUseCase,
    private readonly apiResponse: ApiResponseService,
  ) {}

  @Permissions('ORGANIZER')
  @Get()
  async list(
    @Param('eventId') eventId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const items = await this.listScheduleItemsUseCase.execute({
      eventId,
      organizerId: user.organizerId,
    });
    return this.apiResponse.success(
      'Schedule retrieved',
      items.map(presentScheduleItem),
    );
  }

  @Permissions('ORGANIZER')
  @Post()
  async create(
    @Param('eventId') eventId: string,
    @Body() dto: CreateScheduleItemDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const item = await this.createScheduleItemUseCase.execute({
      eventId,
      organizerId: user.organizerId,
      title: dto.title,
      description: dto.description,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
    });
    return this.apiResponse.success(
      'Schedule item created',
      presentScheduleItem(item),
    );
  }

  @Permissions('ORGANIZER')
  @Put(':itemId')
  async update(
    @Param('eventId') eventId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateScheduleItemDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const item = await this.updateScheduleItemUseCase.execute({
      id: itemId,
      eventId,
      organizerId: user.organizerId,
      title: dto.title,
      description: dto.description,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
    });
    return this.apiResponse.success(
      'Schedule item updated',
      presentScheduleItem(item),
    );
  }

  @Permissions('ORGANIZER')
  @Delete(':itemId')
  async remove(
    @Param('eventId') eventId: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.deleteScheduleItemUseCase.execute({
      id: itemId,
      eventId,
      organizerId: user.organizerId,
    });
    return this.apiResponse.success('Schedule item deleted', null);
  }
}
