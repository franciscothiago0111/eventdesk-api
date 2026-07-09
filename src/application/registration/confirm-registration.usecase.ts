import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { EVENT_REPOSITORY } from '../../domain/event/event.repository';
import type { EventRepository } from '../../domain/event/event.repository';
import { REGISTRATION_REPOSITORY } from '../../domain/registration/registration.repository';
import type { RegistrationRepository } from '../../domain/registration/registration.repository';
import { RegistrationAggregate } from '../../domain/registration/registration.aggregate';
import { RegistrationConfirmed } from '../../domain/registration/events/registration-confirmed.event';
import { EventDispatcherService } from '../../infrastructure/events/event-dispatcher.service';
import { EVENT_NAMES } from '../../infrastructure/events/event-names.constant';
import { InvalidEventPassError } from '../../domain/shared/domain-error';

export interface ConfirmRegistrationParams {
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  /** Present when an authenticated organizer is registering an attendee directly. */
  organizerId?: string;
  /** Access code supplied on the public registration page, checked against event.passHash. */
  pass?: string;
}

@Injectable()
export class ConfirmRegistrationUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    @Inject(REGISTRATION_REPOSITORY)
    private readonly registrationRepository: RegistrationRepository,
    private readonly dispatcher: EventDispatcherService,
  ) {}

  async execute(
    params: ConfirmRegistrationParams,
  ): Promise<RegistrationAggregate> {
    const event = await this.eventRepository.findById(params.eventId);

    if (params.organizerId !== undefined) {
      if (!event || event.organizerId !== params.organizerId) {
        throw new NotFoundException('Event not found');
      }
    } else {
      if (!event || event.status !== 'PUBLISHED') {
        throw new NotFoundException('Event not found');
      }
      if (event.hasPass()) {
        const isValid =
          !!params.pass && (await bcrypt.compare(params.pass, event.passHash!));
        if (!isValid) {
          throw new InvalidEventPassError('invalid or missing event pass');
        }
      }
    }

    event.reserveSlot();

    const registration = RegistrationAggregate.confirm({
      id: randomUUID(),
      eventId: event.id,
      attendeeName: params.attendeeName,
      attendeeEmail: params.attendeeEmail,
    });

    await this.registrationRepository.save(registration);
    await this.eventRepository.save(event);

    this.dispatcher.dispatch(
      EVENT_NAMES.REGISTRATION_CONFIRMED,
      new RegistrationConfirmed(
        registration.id,
        registration.eventId,
        event.organizerId,
        event.name,
        registration.attendeeName,
        registration.attendeeEmail,
        registration.checkInCode.value,
      ),
    );

    return registration;
  }
}
