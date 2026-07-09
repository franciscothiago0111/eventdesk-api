import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY } from '../../domain/notification/notification.repository';
import type { NotificationRepository } from '../../domain/notification/notification.repository';
import { NotificationAggregate } from '../../domain/notification/notification.aggregate';

@Injectable()
export class MarkNotificationReadUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(params: {
    id: string;
    userId: string;
  }): Promise<NotificationAggregate> {
    const notification = await this.notificationRepository.findById(
      params.id,
    );
    if (!notification || notification.userId !== params.userId) {
      throw new NotFoundException('Notification not found');
    }

    notification.markAsRead();
    await this.notificationRepository.save(notification);

    return notification;
  }
}
