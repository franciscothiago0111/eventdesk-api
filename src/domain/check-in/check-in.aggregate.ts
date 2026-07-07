export interface CheckInProps {
  id: string;
  registrationId: string;
  checkedInById: string;
  checkedInAt: Date;
  fromOfflineSync: boolean;
}

export class CheckInAggregate {
  private constructor(private props: CheckInProps) {}

  static record(params: {
    id: string;
    registrationId: string;
    checkedInById: string;
    fromOfflineSync?: boolean;
  }): CheckInAggregate {
    return new CheckInAggregate({
      ...params,
      checkedInAt: new Date(),
      fromOfflineSync: params.fromOfflineSync ?? false,
    });
  }

  static rehydrate(props: CheckInProps): CheckInAggregate {
    return new CheckInAggregate(props);
  }

  get id() {
    return this.props.id;
  }
  get registrationId() {
    return this.props.registrationId;
  }
  get checkedInById() {
    return this.props.checkedInById;
  }
  get checkedInAt() {
    return this.props.checkedInAt;
  }
  get fromOfflineSync() {
    return this.props.fromOfflineSync;
  }
}
