import { Module } from '@nestjs/common';
import { EventCreateController } from './event-create/event-create.controller';
import { EventListController } from './event-list/event-list.controller';
import { EventFindController } from './event-find/event-find.controller';
import { EventPublishController } from './event-publish/event-publish.controller';
import { EventCloseController } from './event-close/event-close.controller';
import { EventUpdateController } from './event-update/event-update.controller';
import { CreateEventUseCase } from '../../application/event/create-event.usecase';
import { ListEventsUseCase } from '../../application/event/list-events.usecase';
import { FindEventUseCase } from '../../application/event/find-event.usecase';
import { PublishEventUseCase } from '../../application/event/publish-event.usecase';
import { CloseEventUseCase } from '../../application/event/close-event.usecase';
import { UpdateEventUseCase } from '../../application/event/update-event.usecase';
import { EventListener } from '../../application/event/event.listener';
import { EVENT_REPOSITORY } from '../../domain/event/event.repository';
import { PrismaEventRepository } from '../../infrastructure/database/event.repository';
import { EventDispatcherService } from '../../infrastructure/events/event-dispatcher.service';
import { ApiResponseService } from '../../shared/services/api-response.service';

@Module({
  controllers: [
    EventCreateController,
    EventListController,
    EventFindController,
    EventPublishController,
    EventCloseController,
    EventUpdateController,
  ],
  providers: [
    CreateEventUseCase,
    ListEventsUseCase,
    FindEventUseCase,
    PublishEventUseCase,
    CloseEventUseCase,
    UpdateEventUseCase,
    EventListener,
    EventDispatcherService,
    ApiResponseService,
    { provide: EVENT_REPOSITORY, useClass: PrismaEventRepository },
  ],
})
export class EventModule {}
