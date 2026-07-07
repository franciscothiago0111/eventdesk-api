import { CheckInRepository } from '../../domain/check-in/check-in.repository';
import { CheckInAggregate } from '../../domain/check-in/check-in.aggregate';

export class InMemoryCheckInRepository implements CheckInRepository {
  private readonly checkIns = new Map<string, CheckInAggregate>();

  save(checkIn: CheckInAggregate): Promise<void> {
    this.checkIns.set(checkIn.id, checkIn);
    return Promise.resolve();
  }

  existsForRegistration(registrationId: string): Promise<boolean> {
    return Promise.resolve(
      [...this.checkIns.values()].some(
        (checkIn) => checkIn.registrationId === registrationId,
      ),
    );
  }

  countForEvent(): Promise<number> {
    return Promise.resolve(this.checkIns.size);
  }
}
