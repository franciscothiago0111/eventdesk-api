import { ScheduleItemAggregate } from './schedule-item.aggregate';

export interface ScheduleItemRepository {
  save(item: ScheduleItemAggregate): Promise<void>;
  findById(id: string): Promise<ScheduleItemAggregate | null>;
  findByEvent(eventId: string): Promise<ScheduleItemAggregate[]>;
  delete(id: string): Promise<void>;
}

export const SCHEDULE_ITEM_REPOSITORY = Symbol('SCHEDULE_ITEM_REPOSITORY');
