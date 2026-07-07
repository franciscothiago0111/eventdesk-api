import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENT_NAMES } from '../../infrastructure/events/event-names.constant';
import { QUEUE_NAMES } from '../../infrastructure/queue/queue-names.constant';
import { RegistrationConfirmed } from '../../domain/registration/events/registration-confirmed.event';

@Injectable()
export class RegistrationListener {
  constructor(
    @InjectQueue(QUEUE_NAMES.EMAIL) private readonly emailQueue: Queue,
  ) {}

  @OnEvent(EVENT_NAMES.REGISTRATION_CONFIRMED)
  async onRegistrationConfirmed(payload: RegistrationConfirmed) {
    await this.emailQueue.add('confirmation-email', {
      registrationId: payload.registrationId,
      eventId: payload.eventId,
      attendeeEmail: payload.attendeeEmail,
      checkInCode: payload.checkInCode,
    });
  }
}
