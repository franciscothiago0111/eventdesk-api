import { ScheduleItemRepository } from '../../domain/schedule/schedule-item.repository';
import { ScheduleItemAggregate } from '../../domain/schedule/schedule-item.aggregate';

export class InMemoryScheduleItemRepository implements ScheduleItemRepository {
  private readonly items = new Map<string, ScheduleItemAggregate>();

  save(item: ScheduleItemAggregate): Promise<void> {
    this.items.set(item.id, item);
    return Promise.resolve();
  }

  findById(id: string): Promise<ScheduleItemAggregate | null> {
    return Promise.resolve(this.items.get(id) ?? null);
  }

  findByEvent(eventId: string): Promise<ScheduleItemAggregate[]> {
    return Promise.resolve(
      [...this.items.values()]
        .filter((item) => item.eventId === eventId)
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
    );
  }

  delete(id: string): Promise<void> {
    this.items.delete(id);
    return Promise.resolve();
  }
}
