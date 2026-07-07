import { EventAggregate } from '../../domain/event/event.aggregate';

export function presentEvent(event: EventAggregate) {
  return {
    id: event.id,
    organizerId: event.organizerId,
    name: event.name,
    description: event.description,
    startDate: event.dateRange.startDate,
    endDate: event.dateRange.endDate,
    capacity: event.capacity.max,
    registered: event.capacity.current,
    status: event.status,
  };
}
