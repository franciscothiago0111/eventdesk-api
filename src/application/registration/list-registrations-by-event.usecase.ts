import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EVENT_REPOSITORY } from '../../domain/event/event.repository';
import type { EventRepository } from '../../domain/event/event.repository';
import { REGISTRATION_REPOSITORY } from '../../domain/registration/registration.repository';
import type { RegistrationRepository } from '../../domain/registration/registration.repository';
import { RegistrationAggregate } from '../../domain/registration/registration.aggregate';

@Injectable()
export class ListRegistrationsByEventUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    @Inject(REGISTRATION_REPOSITORY)
    private readonly registrationRepository: RegistrationRepository,
  ) {}

  async execute(params: {
    eventId: string;
    organizerId: string;
  }): Promise<RegistrationAggregate[]> {
    const event = await this.eventRepository.findById(params.eventId);
    if (!event || event.organizerId !== params.organizerId) {
      throw new NotFoundException('Event not found');
    }

    return this.registrationRepository.findByEvent(params.eventId);
  }
}
