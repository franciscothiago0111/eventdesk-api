import { CheckInAggregate } from './check-in.aggregate';

export interface CheckInRepository {
  save(checkIn: CheckInAggregate): Promise<void>;
  existsForRegistration(registrationId: string): Promise<boolean>;
  countForEvent(eventId: string): Promise<number>;
}

export const CHECK_IN_REPOSITORY = Symbol('CHECK_IN_REPOSITORY');
