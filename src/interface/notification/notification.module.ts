import { Module } from '@nestjs/common';
import { QueueModule } from '../../infrastructure/queue/queue.module';
import { WebsocketModule } from '../../infrastructure/websocket/websocket.module';
import { NotificationController } from './notification.controller';
import { ListNotificationsUseCase } from '../../application/notification/list-notifications.usecase';
import { MarkNotificationReadUseCase } from '../../application/notification/mark-notification-read.usecase';
import { CountUnreadNotificationsUseCase } from '../../application/notification/count-unread-notifications.usecase';
import { NotificationProcessor } from '../../application/notification/notification.processor';
import { NOTIFICATION_REPOSITORY } from '../../domain/notification/notification.repository';
import { PrismaNotificationRepository } from '../../infrastructure/database/notification.repository';
import { ApiResponseService } from '../../shared/services/api-response.service';

@Module({
  imports: [QueueModule, WebsocketModule],
  controllers: [NotificationController],
  providers: [
    ListNotificationsUseCase,
    MarkNotificationReadUseCase,
    CountUnreadNotificationsUseCase,
    NotificationProcessor,
    ApiResponseService,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: PrismaNotificationRepository,
    },
  ],
})
export class NotificationModule {}
