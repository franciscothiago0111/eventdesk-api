export class EventPublished {
  constructor(
    public readonly eventId: string,
    public readonly organizerId: string,
  ) {}
}
