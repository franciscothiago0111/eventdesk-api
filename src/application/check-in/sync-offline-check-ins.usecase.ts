import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { REGISTRATION_REPOSITORY } from '../../domain/registration/registration.repository';
import type { RegistrationRepository } from '../../domain/registration/registration.repository';
import { CHECK_IN_REPOSITORY } from '../../domain/check-in/check-in.repository';
import type { CheckInRepository } from '../../domain/check-in/check-in.repository';
import { CheckInAggregate } from '../../domain/check-in/check-in.aggregate';
import { AttendeeCheckedIn } from '../../domain/check-in/events/attendee-checked-in.event';
import { EventDispatcherService } from '../../infrastructure/events/event-dispatcher.service';
import { EVENT_NAMES } from '../../infrastructure/events/event-names.constant';

export interface OfflineCheckInItem {
  checkInCode: string;
}

export type OfflineCheckInOutcome =
  'recorded' | 'duplicate' | 'not_found' | 'not_confirmed';

export interface OfflineCheckInResult {
  checkInCode: string;
  status: OfflineCheckInOutcome;
}

@Injectable()
export class SyncOfflineCheckInsUseCase {
  constructor(
    @Inject(REGISTRATION_REPOSITORY)
    private readonly registrationRepository: RegistrationRepository,
    @Inject(CHECK_IN_REPOSITORY)
    private readonly checkInRepository: CheckInRepository,
    private readonly dispatcher: EventDispatcherService,
  ) {}

  async execute(params: {
    checkedInById: string;
    items: OfflineCheckInItem[];
  }): Promise<OfflineCheckInResult[]> {
    const results: OfflineCheckInResult[] = [];

    for (const item of params.items) {
      results.push(await this.syncOne(params.checkedInById, item));
    }

    return results;
  }

  private async syncOne(
    checkedInById: string,
    item: OfflineCheckInItem,
  ): Promise<OfflineCheckInResult> {
    const registration = await this.registrationRepository.findByCheckInCode(
      item.checkInCode,
    );
    if (!registration) {
      return { checkInCode: item.checkInCode, status: 'not_found' };
    }

    if (registration.status !== 'CONFIRMED') {
      return { checkInCode: item.checkInCode, status: 'not_confirmed' };
    }

    const alreadyCheckedIn = await this.checkInRepository.existsForRegistration(
      registration.id,
    );
    if (alreadyCheckedIn) {
      return { checkInCode: item.checkInCode, status: 'duplicate' };
    }

    const checkIn = CheckInAggregate.record({
      id: randomUUID(),
      registrationId: registration.id,
      checkedInById,
      fromOfflineSync: true,
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

    return { checkInCode: item.checkInCode, status: 'recorded' };
  }
}
