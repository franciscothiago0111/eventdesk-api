import { RegistrationRepository } from '../../domain/registration/registration.repository';
import { RegistrationAggregate } from '../../domain/registration/registration.aggregate';

export class InMemoryRegistrationRepository implements RegistrationRepository {
  private readonly registrations = new Map<string, RegistrationAggregate>();

  save(registration: RegistrationAggregate): Promise<void> {
    this.registrations.set(registration.id, registration);
    return Promise.resolve();
  }

  findById(id: string): Promise<RegistrationAggregate | null> {
    return Promise.resolve(this.registrations.get(id) ?? null);
  }

  findByCheckInCode(code: string): Promise<RegistrationAggregate | null> {
    return Promise.resolve(
      [...this.registrations.values()].find(
        (registration) => registration.checkInCode.value === code,
      ) ?? null,
    );
  }

  findByEvent(eventId: string): Promise<RegistrationAggregate[]> {
    return Promise.resolve(
      [...this.registrations.values()].filter(
        (registration) => registration.eventId === eventId,
      ),
    );
  }
}
