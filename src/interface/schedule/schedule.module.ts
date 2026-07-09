import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { CreateScheduleItemUseCase } from '../../application/schedule/create-schedule-item.usecase';
import { UpdateScheduleItemUseCase } from '../../application/schedule/update-schedule-item.usecase';
import { DeleteScheduleItemUseCase } from '../../application/schedule/delete-schedule-item.usecase';
import { ListScheduleItemsUseCase } from '../../application/schedule/list-schedule-items.usecase';
import { SCHEDULE_ITEM_REPOSITORY } from '../../domain/schedule/schedule-item.repository';
import { PrismaScheduleItemRepository } from '../../infrastructure/database/schedule-item.repository';
import { EVENT_REPOSITORY } from '../../domain/event/event.repository';
import { PrismaEventRepository } from '../../infrastructure/database/event.repository';
import { ApiResponseService } from '../../shared/services/api-response.service';

@Module({
  controllers: [ScheduleController],
  providers: [
    CreateScheduleItemUseCase,
    UpdateScheduleItemUseCase,
    DeleteScheduleItemUseCase,
    ListScheduleItemsUseCase,
    ApiResponseService,
    { provide: SCHEDULE_ITEM_REPOSITORY, useClass: PrismaScheduleItemRepository },
    { provide: EVENT_REPOSITORY, useClass: PrismaEventRepository },
  ],
})
export class ScheduleModule {}
