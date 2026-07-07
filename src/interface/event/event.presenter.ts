import { EventAggregate } from '../../domain/event/event.aggregate';

export function presentEvent(event: EventAggregate) {
  return {
    id: event.id,
    organizerId: event.organizerId,
    name: event.name,
    description: event.description,
    location: event.location,
    profileImageUrl: event.profileImageUrl,
    coverImageUrl: event.coverImageUrl,
    hasPass: event.hasPass(),
    startDate: event.dateRange.startDate,
    endDate: event.dateRange.endDate,
    capacity: event.capacity.max,
    registered: event.capacity.current,
    status: event.status,
  };
}

export function presentPublicEvent(event: EventAggregate) {
  return {
    id: event.id,
    name: event.name,
    description: event.description,
    location: event.location,
    profileImageUrl: event.profileImageUrl,
    coverImageUrl: event.coverImageUrl,
    requiresPass: event.hasPass(),
    startDate: event.dateRange.startDate,
    endDate: event.dateRange.endDate,
    capacity: event.capacity.max,
    registered: event.capacity.current,
    status: event.status,
  };
}
