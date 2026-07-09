export type EventImageType = 'PROFILE' | 'COVER' | 'GALLERY';

export interface EventImageProps {
  id: string;
  eventId: string;
  url: string;
  key: string;
  type: EventImageType;
  caption: string | null;
  createdAt: Date;
}

export class EventImageAggregate {
  private constructor(private props: EventImageProps) {}

  static create(props: EventImageProps): EventImageAggregate {
    return new EventImageAggregate(props);
  }

  get id() {
    return this.props.id;
  }
  get eventId() {
    return this.props.eventId;
  }
  get url() {
    return this.props.url;
  }
  get key() {
    return this.props.key;
  }
  get type() {
    return this.props.type;
  }
  get caption() {
    return this.props.caption;
  }
  get createdAt() {
    return this.props.createdAt;
  }
}
