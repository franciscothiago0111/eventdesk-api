import { EventAggregate, EventProps } from './event.aggregate';
import { DateRange } from './date-range.vo';
import { Capacity } from './capacity.vo';
import {
  EventFullError,
  EventNotAcceptingRegistrationsError,
  EventNotEditableError,
  EventNotPublishableError,
} from '../shared/domain-error';

function buildEvent(overrides: Partial<EventProps> = {}): EventAggregate {
  return EventAggregate.create({
    id: 'event-1',
    organizerId: 'organizer-1',
    name: 'Conference',
    description: null,
    dateRange: DateRange.create(new Date('2026-01-01'), new Date('2026-01-02')),
    capacity: Capacity.create(2),
    status: 'DRAFT',
    ...overrides,
  });
}

describe('EventAggregate', () => {
  it('publishes a DRAFT event', () => {
    const event = buildEvent();
    event.publish();
    expect(event.status).toBe('PUBLISHED');
  });

  it('rejects publishing a non-DRAFT event', () => {
    const event = buildEvent({ status: 'PUBLISHED' });
    expect(() => event.publish()).toThrow(EventNotPublishableError);
  });

  it('closes a PUBLISHED event', () => {
    const event = buildEvent({ status: 'PUBLISHED' });
    event.close();
    expect(event.status).toBe('CLOSED');
  });

  it('rejects closing a non-PUBLISHED event', () => {
    const event = buildEvent({ status: 'DRAFT' });
    expect(() => event.close()).toThrow(EventNotPublishableError);
  });

  it('rejects reserving a slot when not PUBLISHED', () => {
    const event = buildEvent({ status: 'DRAFT' });
    expect(() => event.reserveSlot()).toThrow(
      EventNotAcceptingRegistrationsError,
    );
  });

  it('rejects reserving a slot once capacity is full', () => {
    const event = buildEvent({
      status: 'PUBLISHED',
      capacity: Capacity.create(1, 1),
    });
    expect(() => event.reserveSlot()).toThrow(EventFullError);
  });

  it('reserveSlot() increments capacity for a PUBLISHED event with room', () => {
    const event = buildEvent({ status: 'PUBLISHED' });
    event.reserveSlot();
    expect(event.capacity.current).toBe(1);
  });

  it('releaseSlot() decrements capacity', () => {
    const event = buildEvent({
      status: 'PUBLISHED',
      capacity: Capacity.create(2, 1),
    });
    event.releaseSlot();
    expect(event.capacity.current).toBe(0);
  });

  it('updateDetails() rewrites props while DRAFT', () => {
    const event = buildEvent();
    event.updateDetails({
      name: 'Renamed',
      description: 'Now with a description',
      dateRange: DateRange.create(
        new Date('2026-02-01'),
        new Date('2026-02-02'),
      ),
      capacity: Capacity.create(5),
    });
    expect(event.name).toBe('Renamed');
    expect(event.capacity.max).toBe(5);
  });

  it('rejects updateDetails() once the event is no longer DRAFT', () => {
    const event = buildEvent({ status: 'PUBLISHED' });
    expect(() =>
      event.updateDetails({
        name: 'Renamed',
        description: null,
        dateRange: event.dateRange,
        capacity: event.capacity,
      }),
    ).toThrow(EventNotEditableError);
  });
});
