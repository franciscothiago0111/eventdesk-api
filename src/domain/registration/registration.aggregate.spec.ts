import { RegistrationAggregate } from './registration.aggregate';
import { RegistrationNotConfirmableError } from '../shared/domain-error';

describe('RegistrationAggregate', () => {
  it('confirm() creates a CONFIRMED registration with a generated check-in code', () => {
    const registration = RegistrationAggregate.confirm({
      id: 'reg-1',
      eventId: 'event-1',
      attendeeName: 'Jane Doe',
      attendeeEmail: 'jane@example.com',
    });

    expect(registration.status).toBe('CONFIRMED');
    expect(registration.checkInCode.value).toHaveLength(12);
  });

  it('two confirmations generate distinct check-in codes', () => {
    const a = RegistrationAggregate.confirm({
      id: 'reg-1',
      eventId: 'event-1',
      attendeeName: 'Jane Doe',
      attendeeEmail: 'jane@example.com',
    });
    const b = RegistrationAggregate.confirm({
      id: 'reg-2',
      eventId: 'event-1',
      attendeeName: 'John Doe',
      attendeeEmail: 'john@example.com',
    });
    expect(a.checkInCode.equals(b.checkInCode)).toBe(false);
  });

  it('cancel() transitions a CONFIRMED registration to CANCELLED', () => {
    const registration = RegistrationAggregate.confirm({
      id: 'reg-1',
      eventId: 'event-1',
      attendeeName: 'Jane Doe',
      attendeeEmail: 'jane@example.com',
    });
    registration.cancel();
    expect(registration.status).toBe('CANCELLED');
  });

  it('rejects cancelling an already-cancelled registration', () => {
    const registration = RegistrationAggregate.confirm({
      id: 'reg-1',
      eventId: 'event-1',
      attendeeName: 'Jane Doe',
      attendeeEmail: 'jane@example.com',
    });
    registration.cancel();
    expect(() => registration.cancel()).toThrow(
      RegistrationNotConfirmableError,
    );
  });

  it('assertConfirmed() throws once the registration is cancelled', () => {
    const registration = RegistrationAggregate.confirm({
      id: 'reg-1',
      eventId: 'event-1',
      attendeeName: 'Jane Doe',
      attendeeEmail: 'jane@example.com',
    });
    registration.cancel();
    expect(() => registration.assertConfirmed()).toThrow(
      RegistrationNotConfirmableError,
    );
  });

  it('assertConfirmed() passes for a CONFIRMED registration', () => {
    const registration = RegistrationAggregate.confirm({
      id: 'reg-1',
      eventId: 'event-1',
      attendeeName: 'Jane Doe',
      attendeeEmail: 'jane@example.com',
    });
    expect(() => registration.assertConfirmed()).not.toThrow();
  });
});
