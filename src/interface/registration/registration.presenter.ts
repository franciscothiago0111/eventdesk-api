import { RegistrationAggregate } from '../../domain/registration/registration.aggregate';

export function presentRegistration(registration: RegistrationAggregate) {
  return {
    id: registration.id,
    eventId: registration.eventId,
    attendeeName: registration.attendeeName,
    attendeeEmail: registration.attendeeEmail,
    checkInCode: registration.checkInCode.value,
    status: registration.status,
  };
}
