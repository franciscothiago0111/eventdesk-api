import { Inject, Injectable } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { randomUUID } from 'crypto';
import { QUEUE_NAMES } from '../../infrastructure/queue/queue-names.constant';
import { EventsGateway } from '../../infrastructure/websocket/events.gateway';
import { NOTIFICATION_REPOSITORY } from '../../domain/notification/notification.repository';
import type { NotificationRepository } from '../../domain/notification/notification.repository';
import { NotificationAggregate } from '../../domain/notification/notification.aggregate';
import { RegistrationConfirmedNotificationJob } from './notification.job';

@Injectable()
@Processor(QUEUE_NAMES.NOTIFICATION)
export class NotificationProcessor {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @Process('registration-confirmed')
  async handleRegistrationConfirmed(
    job: Job<RegistrationConfirmedNotificationJob>,
  ) {
    const { organizerId, eventId, eventName, registrationId, attendeeName } =
      job.data;

    const notification = NotificationAggregate.create({
      id: randomUUID(),
      userId: organizerId,
      type: 'REGISTRATION_CONFIRMED',
      title: 'New registration',
      message: `${attendeeName} confirmed their registration for ${eventName}.`,
      entityType: 'EVENT',
      entityId: eventId,
    });

    await this.notificationRepository.save(notification);

    this.eventsGateway.emitNotification(organizerId, {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      entityType: notification.entityType,
      entityId: notification.entityId,
      read: notification.read,
      createdAt: notification.createdAt,
    });

    return { notificationId: notification.id, registrationId };
  }
}
