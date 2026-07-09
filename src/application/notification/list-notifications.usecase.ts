import { Inject, Injectable } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY } from '../../domain/notification/notification.repository';
import type { NotificationRepository } from '../../domain/notification/notification.repository';
import { NotificationAggregate } from '../../domain/notification/notification.aggregate';

@Injectable()
export class ListNotificationsUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(params: { userId: string }): Promise<NotificationAggregate[]> {
    return this.notificationRepository.findByUser(params.userId);
  }
}
