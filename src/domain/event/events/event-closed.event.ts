export class EventClosed {
  constructor(
    public readonly eventId: string,
    public readonly organizerId: string,
  ) {}
}
