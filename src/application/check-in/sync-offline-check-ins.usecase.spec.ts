import { SyncOfflineCheckInsUseCase } from './sync-offline-check-ins.usecase';
import { InMemoryRegistrationRepository } from '../testing/in-memory-registration.repository';
import { InMemoryCheckInRepository } from '../testing/in-memory-check-in.repository';
import { RegistrationAggregate } from '../../domain/registration/registration.aggregate';
import { EventDispatcherService } from '../../infrastructure/events/event-dispatcher.service';
import { EVENT_NAMES } from '../../infrastructure/events/event-names.constant';

function buildRegistration() {
  return RegistrationAggregate.confirm({
    id: 'reg-1',
    eventId: 'event-1',
    attendeeName: 'Jane Doe',
    attendeeEmail: 'jane@example.com',
  });
}

describe('SyncOfflineCheckInsUseCase', () => {
  let registrationRepository: InMemoryRegistrationRepository;
  let checkInRepository: InMemoryCheckInRepository;
  let dispatcher: { dispatch: jest.Mock };
  let useCase: SyncOfflineCheckInsUseCase;

  beforeEach(() => {
    registrationRepository = new InMemoryRegistrationRepository();
    checkInRepository = new InMemoryCheckInRepository();
    dispatcher = { dispatch: jest.fn() };
    useCase = new SyncOfflineCheckInsUseCase(
      registrationRepository,
      checkInRepository,
      dispatcher as unknown as EventDispatcherService,
    );
  });

  it('records a check-in for a confirmed registration and dispatches ATTENDEE_CHECKED_IN', async () => {
    const registration = buildRegistration();
    await registrationRepository.save(registration);

    const results = await useCase.execute({
      checkedInById: 'staff-1',
      items: [{ checkInCode: registration.checkInCode.value }],
    });

    expect(results).toEqual([
      { checkInCode: registration.checkInCode.value, status: 'recorded' },
    ]);
    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      EVENT_NAMES.ATTENDEE_CHECKED_IN,
      expect.objectContaining({ registrationId: registration.id }),
    );
  });

  it('reports duplicate for a registration already checked in', async () => {
    const registration = buildRegistration();
    await registrationRepository.save(registration);

    const results = await useCase.execute({
      checkedInById: 'staff-1',
      items: [
        { checkInCode: registration.checkInCode.value },
        { checkInCode: registration.checkInCode.value },
      ],
    });

    expect(results[0].status).toBe('recorded');
    expect(results[1].status).toBe('duplicate');
  });

  it('reports not_found for an unknown check-in code', async () => {
    const results = await useCase.execute({
      checkedInById: 'staff-1',
      items: [{ checkInCode: 'unknown-code' }],
    });

    expect(results).toEqual([
      { checkInCode: 'unknown-code', status: 'not_found' },
    ]);
  });

  it('reports not_confirmed for a cancelled registration', async () => {
    const registration = buildRegistration();
    registration.cancel();
    await registrationRepository.save(registration);

    const results = await useCase.execute({
      checkedInById: 'staff-1',
      items: [{ checkInCode: registration.checkInCode.value }],
    });

    expect(results).toEqual([
      { checkInCode: registration.checkInCode.value, status: 'not_confirmed' },
    ]);
  });
});
