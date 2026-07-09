import { NotificationAggregate } from './notification.aggregate';

export interface NotificationRepository {
  save(notification: NotificationAggregate): Promise<void>;
  findById(id: string): Promise<NotificationAggregate | null>;
  findByUser(userId: string): Promise<NotificationAggregate[]>;
  countUnreadByUser(userId: string): Promise<number>;
}

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');
