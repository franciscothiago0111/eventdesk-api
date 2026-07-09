import { ScheduleItemAggregate } from '../../domain/schedule/schedule-item.aggregate';

export function presentScheduleItem(item: ScheduleItemAggregate) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    startTime: item.startTime,
    endTime: item.endTime,
  };
}
