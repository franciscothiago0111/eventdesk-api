import { RegistrationAggregate } from './registration.aggregate';

export interface RegistrationRepository {
  save(registration: RegistrationAggregate): Promise<void>;
  findById(id: string): Promise<RegistrationAggregate | null>;
  findByCheckInCode(code: string): Promise<RegistrationAggregate | null>;
  findByEvent(eventId: string): Promise<RegistrationAggregate[]>;
}

export const REGISTRATION_REPOSITORY = Symbol('REGISTRATION_REPOSITORY');
