import { NotFoundException } from '@nestjs/common';
import { RecordCheckInUseCase } from './record-check-in.usecase';
import { RegistrationAggregate } from '../../domain/registration/registration.aggregate';
import { DuplicateCheckInError } from '../../domain/shared/domain-error';
import type { RegistrationRepository } from '../../domain/registration/registration.repository';
import type { CheckInRepository } from '../../domain/check-in/check-in.repository';
import { EventDispatcherService } from '../../infrastructure/events/event-dispatcher.service';

function buildRegistration() {
  return RegistrationAggregate.confirm({
    id: 'reg-1',
    eventId: 'event-1',
    attendeeName: 'Jane Doe',
    attendeeEmail: 'jane@example.com',
  });
}

describe('RecordCheckInUseCase', () => {
  let registration: RegistrationAggregate;
  let registrationRepository: jest.Mocked<RegistrationRepository>;
  let checkInRepository: jest.Mocked<CheckInRepository>;
  let dispatcher: { dispatch: jest.Mock };
  let useCase: RecordCheckInUseCase;

  beforeEach(() => {
    registration = buildRegistration();
    registrationRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByCheckInCode: jest.fn().mockResolvedValue(registration),
      findByEvent: jest.fn(),
    };
    checkInRepository = {
      save: jest.fn(),
      existsForRegistration: jest.fn().mockResolvedValue(false),
      countForEvent: jest.fn(),
    };
    dispatcher = { dispatch: jest.fn() };
    useCase = new RecordCheckInUseCase(
      registrationRepository,
      checkInRepository,
      dispatcher as unknown as EventDispatcherService,
    );
  });

  it('records a check-in for a confirmed registration with no prior check-in', async () => {
    const checkIn = await useCase.execute({
      checkInCode: registration.checkInCode.value,
      checkedInById: 'staff-1',
    });

    expect(checkIn.registrationId).toBe(registration.id);
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked interface method, not a class this-binding
    expect(checkInRepository.save).toHaveBeenCalledWith(checkIn);
    expect(dispatcher.dispatch).toHaveBeenCalled();
  });

  it('rejects a duplicate check-in for the same registration', async () => {
    checkInRepository.existsForRegistration.mockResolvedValue(true);

    await expect(
      useCase.execute({
        checkInCode: registration.checkInCode.value,
        checkedInById: 'staff-1',
      }),
    ).rejects.toThrow(DuplicateCheckInError);
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked interface method, not a class this-binding
    expect(checkInRepository.save).not.toHaveBeenCalled();
  });

  it('rejects checking in an unknown check-in code', async () => {
    registrationRepository.findByCheckInCode.mockResolvedValue(null);

    await expect(
      useCase.execute({ checkInCode: 'unknown', checkedInById: 'staff-1' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects checking in a cancelled registration', async () => {
    registration.cancel();

    await expect(
      useCase.execute({
        checkInCode: registration.checkInCode.value,
        checkedInById: 'staff-1',
      }),
    ).rejects.toThrow();
  });
});
