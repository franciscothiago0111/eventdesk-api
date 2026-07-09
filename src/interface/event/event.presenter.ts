import { EventAggregate } from '../../domain/event/event.aggregate';
import { EventImageAggregate } from '../../domain/event-image/event-image.aggregate';
import { ScheduleItemAggregate } from '../../domain/schedule/schedule-item.aggregate';
import { presentEventImage } from '../event-image/event-image.presenter';
import { presentScheduleItem } from '../schedule/schedule.presenter';

export function presentEvent(
  event: EventAggregate,
  images: EventImageAggregate[] = [],
  schedule: ScheduleItemAggregate[] = [],
) {
  return {
    id: event.id,
    organizerId: event.organizerId,
    name: event.name,
    description: event.description,
    location: event.location,
    category: event.category,
    hasPass: event.hasPass(),
    startDate: event.dateRange.startDate,
    endDate: event.dateRange.endDate,
    capacity: event.capacity.max,
    registered: event.capacity.current,
    status: event.status,
    images: images.map(presentEventImage),
    schedule: schedule.map(presentScheduleItem),
  };
}

export function presentPublicEvent(
  event: EventAggregate,
  images: EventImageAggregate[] = [],
  schedule: ScheduleItemAggregate[] = [],
) {
  return {
    id: event.id,
    name: event.name,
    description: event.description,
    location: event.location,
    category: event.category,
    requiresPass: event.hasPass(),
    startDate: event.dateRange.startDate,
    endDate: event.dateRange.endDate,
    capacity: event.capacity.max,
    registered: event.capacity.current,
    status: event.status,
    images: images.map(presentEventImage),
    schedule: schedule.map(presentScheduleItem),
  };
}
