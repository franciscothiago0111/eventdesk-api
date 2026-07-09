export class RegistrationConfirmed {
  constructor(
    public readonly registrationId: string,
    public readonly eventId: string,
    public readonly organizerId: string,
    public readonly eventName: string,
    public readonly attendeeName: string,
    public readonly attendeeEmail: string,
    public readonly checkInCode: string,
  ) {}
}
