import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ListNotificationsUseCase } from '../../application/notification/list-notifications.usecase';
import { MarkNotificationReadUseCase } from '../../application/notification/mark-notification-read.usecase';
import { CountUnreadNotificationsUseCase } from '../../application/notification/count-unread-notifications.usecase';
import { ApiResponseService } from '../../shared/services/api-response.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../shared/decorators/current-user.decorator';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { presentNotification } from './notification.presenter';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly listNotificationsUseCase: ListNotificationsUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
    private readonly countUnreadNotificationsUseCase: CountUnreadNotificationsUseCase,
    private readonly apiResponse: ApiResponseService,
  ) {}

  @Permissions('ORGANIZER')
  @Get()
  async list(@CurrentUser() user: CurrentUserPayload) {
    const notifications = await this.listNotificationsUseCase.execute({
      userId: user.id,
    });
    return this.apiResponse.success(
      'Notifications retrieved',
      notifications.map(presentNotification),
    );
  }

  @Permissions('ORGANIZER')
  @Get('unread-count')
  async unreadCount(@CurrentUser() user: CurrentUserPayload) {
    const count = await this.countUnreadNotificationsUseCase.execute({
      userId: user.id,
    });
    return this.apiResponse.success('Unread count retrieved', { count });
  }

  @Permissions('ORGANIZER')
  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const notification = await this.markNotificationReadUseCase.execute({
      id,
      userId: user.id,
    });
    return this.apiResponse.success(
      'Notification marked as read',
      presentNotification(notification),
    );
  }
}
