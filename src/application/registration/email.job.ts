export interface ConfirmationEmailJob {
  registrationId: string;
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  checkInCode: string;
}
