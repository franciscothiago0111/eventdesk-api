import { CheckInAggregate } from './check-in.aggregate';

describe('CheckInAggregate', () => {
  it('record() stamps the current time and defaults fromOfflineSync to false', () => {
    const checkIn = CheckInAggregate.record({
      id: 'checkin-1',
      registrationId: 'reg-1',
      checkedInById: 'staff-1',
    });

    expect(checkIn.registrationId).toBe('reg-1');
    expect(checkIn.checkedInById).toBe('staff-1');
    expect(checkIn.fromOfflineSync).toBe(false);
    expect(checkIn.checkedInAt).toBeInstanceOf(Date);
  });

  it('record() honors an explicit fromOfflineSync flag', () => {
    const checkIn = CheckInAggregate.record({
      id: 'checkin-1',
      registrationId: 'reg-1',
      checkedInById: 'staff-1',
      fromOfflineSync: true,
    });
    expect(checkIn.fromOfflineSync).toBe(true);
  });

  it('rehydrate() restores an aggregate from persisted props', () => {
    const checkedInAt = new Date('2026-01-01T10:00:00.000Z');
    const checkIn = CheckInAggregate.rehydrate({
      id: 'checkin-1',
      registrationId: 'reg-1',
      checkedInById: 'staff-1',
      checkedInAt,
      fromOfflineSync: false,
    });
    expect(checkIn.checkedInAt).toBe(checkedInAt);
  });
});
