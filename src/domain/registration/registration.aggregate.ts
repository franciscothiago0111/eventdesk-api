import { CheckInCode } from './check-in-code.vo';
import { RegistrationNotConfirmableError } from '../shared/domain-error';

export type RegistrationStatus = 'CONFIRMED' | 'CANCELLED';

export interface RegistrationProps {
  id: string;
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  checkInCode: CheckInCode;
  status: RegistrationStatus;
}

export class RegistrationAggregate {
  private constructor(private props: RegistrationProps) {}

  static confirm(params: {
    id: string;
    eventId: string;
    attendeeName: string;
    attendeeEmail: string;
  }): RegistrationAggregate {
    return new RegistrationAggregate({
      ...params,
      checkInCode: CheckInCode.generate(),
      status: 'CONFIRMED',
    });
  }

  static rehydrate(props: RegistrationProps): RegistrationAggregate {
    return new RegistrationAggregate(props);
  }

  get id() {
    return this.props.id;
  }
  get eventId() {
    return this.props.eventId;
  }
  get attendeeName() {
    return this.props.attendeeName;
  }
  get attendeeEmail() {
    return this.props.attendeeEmail;
  }
  get checkInCode() {
    return this.props.checkInCode;
  }
  get status() {
    return this.props.status;
  }

  cancel(): void {
    if (this.props.status !== 'CONFIRMED') {
      throw new RegistrationNotConfirmableError(
        `registration in status ${this.props.status} cannot be cancelled`,
      );
    }
    this.props.status = 'CANCELLED';
  }

  assertConfirmed(): void {
    if (this.props.status !== 'CONFIRMED') {
      throw new RegistrationNotConfirmableError(
        'registration is not confirmed, cannot be checked in',
      );
    }
  }
}
