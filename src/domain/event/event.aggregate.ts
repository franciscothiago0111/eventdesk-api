import { DateRange } from './date-range.vo';
import { Capacity } from './capacity.vo';
import {
  EventFullError,
  EventNotAcceptingRegistrationsError,
  EventNotEditableError,
  EventNotPublishableError,
} from '../shared/domain-error';

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'CANCELLED';

export type EventCategory =
  | 'CONFERENCE'
  | 'WORKSHOP'
  | 'MEETUP'
  | 'HACKATHON'
  | 'WEBINAR'
  | 'TRAINING'
  | 'OTHER';

export interface EventProps {
  id: string;
  organizerId: string;
  name: string;
  description: string | null;
  location: string | null;
  category: EventCategory;
  passHash: string | null;
  dateRange: DateRange;
  capacity: Capacity;
  status: EventStatus;
}

export class EventAggregate {
  private constructor(private props: EventProps) {}

  static create(props: EventProps): EventAggregate {
    return new EventAggregate(props);
  }

  get id() {
    return this.props.id;
  }
  get organizerId() {
    return this.props.organizerId;
  }
  get name() {
    return this.props.name;
  }
  get description() {
    return this.props.description;
  }
  get location() {
    return this.props.location;
  }
  get category() {
    return this.props.category;
  }
  get passHash() {
    return this.props.passHash;
  }
  get dateRange() {
    return this.props.dateRange;
  }
  get capacity() {
    return this.props.capacity;
  }
  get status() {
    return this.props.status;
  }

  updateDetails(props: {
    name: string;
    description: string | null;
    location: string | null;
    category: EventCategory;
    dateRange: DateRange;
    capacity: Capacity;
  }): void {
    if (this.props.status !== 'DRAFT') {
      throw new EventNotEditableError(
        `event in status ${this.props.status} cannot be edited`,
      );
    }
    this.props.name = props.name;
    this.props.description = props.description;
    this.props.location = props.location;
    this.props.category = props.category;
    this.props.dateRange = props.dateRange;
    this.props.capacity = props.capacity;
  }

  setPassHash(passHash: string | null): void {
    this.props.passHash = passHash;
  }

  hasPass(): boolean {
    return this.props.passHash !== null;
  }

  publish(): void {
    if (this.props.status !== 'DRAFT') {
      throw new EventNotPublishableError(
        `event in status ${this.props.status} cannot be published`,
      );
    }
    this.props.status = 'PUBLISHED';
  }

  close(): void {
    if (this.props.status !== 'PUBLISHED') {
      throw new EventNotPublishableError(
        `event in status ${this.props.status} cannot be closed`,
      );
    }
    this.props.status = 'CLOSED';
  }

  assertAcceptingRegistrations(): void {
    if (this.props.status !== 'PUBLISHED') {
      throw new EventNotAcceptingRegistrationsError(
        `event in status ${this.props.status} is not accepting registrations`,
      );
    }
    if (this.props.capacity.isFull()) {
      throw new EventFullError('event has reached capacity');
    }
  }

  reserveSlot(): void {
    this.assertAcceptingRegistrations();
    this.props.capacity = this.props.capacity.withOneMoreOccupant();
  }

  releaseSlot(): void {
    this.props.capacity = this.props.capacity.withOneLessOccupant();
  }
}
