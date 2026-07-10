import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { NotificationRepository } from '../../domain/notification/notification.repository';
import {
  NotificationAggregate,
  NotificationType,
} from '../../domain/notification/notification.aggregate';
import { Notification as PrismaNotification } from '../../generated/prisma/client';

@Injectable()
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(notification: NotificationAggregate): Promise<void> {
    await this.prisma.notification.upsert({
      where: { id: notification.id },
      create: {
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        entityType: notification.entityType,
        entityId: notification.entityId,
        read: notification.read,
      },
      update: {
        read: notification.read,
      },
    });
  }

  async findById(id: string): Promise<NotificationAggregate | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    return notification ? this.toDomain(notification) : null;
  }

  async findByUser(userId: string): Promise<NotificationAggregate[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return notifications.map((notification) => this.toDomain(notification));
  }

  async countUnreadByUser(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, read: false } });
  }

  private toDomain(notification: PrismaNotification): NotificationAggregate {
    return NotificationAggregate.rehydrate({
      id: notification.id,
      userId: notification.userId,
      type: notification.type as NotificationType,
      title: notification.title,
      message: notification.message,
      entityType: notification.entityType,
      entityId: notification.entityId,
      read: notification.read,
      createdAt: notification.createdAt,
    });
  }
}
