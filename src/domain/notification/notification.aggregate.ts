export type NotificationType = 'REGISTRATION_CONFIRMED';

export interface NotificationProps {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  read: boolean;
  createdAt: Date;
}

export class NotificationAggregate {
  private constructor(private props: NotificationProps) {}

  static create(
    props: Omit<NotificationProps, 'read' | 'createdAt'>,
  ): NotificationAggregate {
    return new NotificationAggregate({
      ...props,
      read: false,
      createdAt: new Date(),
    });
  }

  static rehydrate(props: NotificationProps): NotificationAggregate {
    return new NotificationAggregate(props);
  }

  get id() {
    return this.props.id;
  }
  get userId() {
    return this.props.userId;
  }
  get type() {
    return this.props.type;
  }
  get title() {
    return this.props.title;
  }
  get message() {
    return this.props.message;
  }
  get entityType() {
    return this.props.entityType;
  }
  get entityId() {
    return this.props.entityId;
  }
  get read() {
    return this.props.read;
  }
  get createdAt() {
    return this.props.createdAt;
  }

  markAsRead(): void {
    this.props.read = true;
  }
}
