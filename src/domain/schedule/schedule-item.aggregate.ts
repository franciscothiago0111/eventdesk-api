import { DateRange } from '../event/date-range.vo';

export interface ScheduleItemProps {
  id: string;
  eventId: string;
  title: string;
  description: string | null;
  timeRange: DateRange;
  createdAt: Date;
  updatedAt: Date;
}

export class ScheduleItemAggregate {
  private constructor(private props: ScheduleItemProps) {}

  static create(props: ScheduleItemProps): ScheduleItemAggregate {
    return new ScheduleItemAggregate(props);
  }

  get id() {
    return this.props.id;
  }
  get eventId() {
    return this.props.eventId;
  }
  get title() {
    return this.props.title;
  }
  get description() {
    return this.props.description;
  }
  get startTime() {
    return this.props.timeRange.startDate;
  }
  get endTime() {
    return this.props.timeRange.endDate;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  update(props: {
    title: string;
    description: string | null;
    timeRange: DateRange;
  }): void {
    this.props.title = props.title;
    this.props.description = props.description;
    this.props.timeRange = props.timeRange;
  }
}
