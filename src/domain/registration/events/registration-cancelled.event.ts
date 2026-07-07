export class RegistrationCancelled {
  constructor(
    public readonly registrationId: string,
    public readonly eventId: string,
  ) {}
}
