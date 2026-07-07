import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EVENT_REPOSITORY } from '../../domain/event/event.repository';
import type { EventRepository } from '../../domain/event/event.repository';
import { REGISTRATION_REPOSITORY } from '../../domain/registration/registration.repository';
import type { RegistrationRepository } from '../../domain/registration/registration.repository';
import { RegistrationAggregate } from '../../domain/registration/registration.aggregate';
import { RegistrationCancelled } from '../../domain/registration/events/registration-cancelled.event';
import { EventDispatcherService } from '../../infrastructure/events/event-dispatcher.service';
import { EVENT_NAMES } from '../../infrastructure/events/event-names.constant';

@Injectable()
export class CancelRegistrationUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    @Inject(REGISTRATION_REPOSITORY)
    private readonly registrationRepository: RegistrationRepository,
    private readonly dispatcher: EventDispatcherService,
  ) {}

  async execute(params: {
    id: string;
    organizerId: string;
  }): Promise<RegistrationAggregate> {
    const registration = await this.registrationRepository.findById(params.id);
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    const event = await this.eventRepository.findById(registration.eventId);
    if (!event || event.organizerId !== params.organizerId) {
      throw new NotFoundException('Registration not found');
    }

    registration.cancel();
    event.releaseSlot();

    await this.registrationRepository.save(registration);
    await this.eventRepository.save(event);

    this.dispatcher.dispatch(
      EVENT_NAMES.REGISTRATION_CANCELLED,
      new RegistrationCancelled(registration.id, registration.eventId),
    );

    return registration;
  }
}
