import { NotificationAggregate } from '../../domain/notification/notification.aggregate';

export function presentNotification(notification: NotificationAggregate) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    entityType: notification.entityType,
    entityId: notification.entityId,
    read: notification.read,
    createdAt: notification.createdAt,
  };
}
