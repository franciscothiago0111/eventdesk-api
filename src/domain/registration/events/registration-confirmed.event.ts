export class RegistrationConfirmed {
  constructor(
    public readonly registrationId: string,
    public readonly eventId: string,
    public readonly attendeeEmail: string,
    public readonly checkInCode: string,
  ) {}
}
