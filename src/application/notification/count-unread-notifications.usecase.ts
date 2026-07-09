import { Inject, Injectable } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY } from '../../domain/notification/notification.repository';
import type { NotificationRepository } from '../../domain/notification/notification.repository';

@Injectable()
export class CountUnreadNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(params: { userId: string }): Promise<number> {
    return this.notificationRepository.countUnreadByUser(params.userId);
  }
}
