import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { REGISTRATION_REPOSITORY } from '../../domain/registration/registration.repository';
import type { RegistrationRepository } from '../../domain/registration/registration.repository';
import { CHECK_IN_REPOSITORY } from '../../domain/check-in/check-in.repository';
import type { CheckInRepository } from '../../domain/check-in/check-in.repository';
import { CheckInAggregate } from '../../domain/check-in/check-in.aggregate';
import { DuplicateCheckInError } from '../../domain/shared/domain-error';
import { AttendeeCheckedIn } from '../../domain/check-in/events/attendee-checked-in.event';
import { EventDispatcherService } from '../../infrastructure/events/event-dispatcher.service';
import { EVENT_NAMES } from '../../infrastructure/events/event-names.constant';

export interface RecordCheckInParams {
  checkInCode: string;
  checkedInById: string;
  fromOfflineSync?: boolean;
}

@Injectable()
export class RecordCheckInUseCase {
  constructor(
    @Inject(REGISTRATION_REPOSITORY)
    private readonly registrationRepository: RegistrationRepository,
    @Inject(CHECK_IN_REPOSITORY)
    private readonly checkInRepository: CheckInRepository,
    private readonly dispatcher: EventDispatcherService,
  ) {}

  async execute(params: RecordCheckInParams): Promise<CheckInAggregate> {
    const registration = await this.registrationRepository.findByCheckInCode(
      params.checkInCode,
    );
    if (!registration) {
      throw new NotFoundException('Registration not found for this code');
    }

    registration.assertConfirmed();

    const alreadyCheckedIn = await this.checkInRepository.existsForRegistration(
      registration.id,
    );
    if (alreadyCheckedIn) {
      throw new DuplicateCheckInError(
        'registration has already been checked in',
      );
    }

    const checkIn = CheckInAggregate.record({
      id: randomUUID(),
      registrationId: registration.id,
      checkedInById: params.checkedInById,
      fromOfflineSync: params.fromOfflineSync,
    });

    await this.checkInRepository.save(checkIn);

    this.dispatcher.dispatch(
      EVENT_NAMES.ATTENDEE_CHECKED_IN,
      new AttendeeCheckedIn(
        checkIn.id,
        registration.eventId,
        checkIn.registrationId,
        checkIn.checkedInById,
        checkIn.fromOfflineSync,
      ),
    );

    return checkIn;
  }
}
