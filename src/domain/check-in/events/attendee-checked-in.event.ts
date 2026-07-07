export class AttendeeCheckedIn {
  constructor(
    public readonly checkInId: string,
    public readonly eventId: string,
    public readonly registrationId: string,
    public readonly checkedInById: string,
    public readonly fromOfflineSync: boolean,
  ) {}
}
