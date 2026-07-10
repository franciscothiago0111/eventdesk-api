export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidDateRangeError extends DomainError {}
export class InvalidCapacityError extends DomainError {}
export class EventNotPublishableError extends DomainError {}
export class EventNotEditableError extends DomainError {}
export class EventFullError extends DomainError {}
export class EventNotAcceptingRegistrationsError extends DomainError {}
export class RegistrationNotConfirmableError extends DomainError {}
export class DuplicateCheckInError extends DomainError {}
export class InvalidEventPassError extends DomainError {}
export class ScheduleItemOutOfRangeError extends DomainError {}
