import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENT_NAMES } from '../../infrastructure/events/event-names.constant';
import { QUEUE_NAMES } from '../../infrastructure/queue/queue-names.constant';
import { RegistrationConfirmed } from '../../domain/registration/events/registration-confirmed.event';
import { EventsGateway } from '../../infrastructure/websocket/events.gateway';

@Injectable()
export class RegistrationListener {
  constructor(
    @InjectQueue(QUEUE_NAMES.EMAIL) private readonly emailQueue: Queue,
    @InjectQueue(QUEUE_NAMES.NOTIFICATION)
    private readonly notificationQueue: Queue,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @OnEvent(EVENT_NAMES.REGISTRATION_CONFIRMED)
  async onRegistrationConfirmed(payload: RegistrationConfirmed) {
    await this.emailQueue.add('confirmation-email', {
      registrationId: payload.registrationId,
      eventId: payload.eventId,
      attendeeEmail: payload.attendeeEmail,
      checkInCode: payload.checkInCode,
    });

    await this.notificationQueue.add('registration-confirmed', {
      organizerId: payload.organizerId,
      eventId: payload.eventId,
      eventName: payload.eventName,
      registrationId: payload.registrationId,
      attendeeName: payload.attendeeName,
    });

    this.eventsGateway.emitRegistrationConfirmed(payload.eventId, {
      registrationId: payload.registrationId,
      eventId: payload.eventId,
      attendeeName: payload.attendeeName,
      attendeeEmail: payload.attendeeEmail,
    });
  }
}
