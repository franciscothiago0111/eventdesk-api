import { CheckInAggregate } from '../../domain/check-in/check-in.aggregate';

export function presentCheckIn(checkIn: CheckInAggregate) {
  return {
    id: checkIn.id,
    registrationId: checkIn.registrationId,
    checkedInById: checkIn.checkedInById,
    checkedInAt: checkIn.checkedInAt,
    fromOfflineSync: checkIn.fromOfflineSync,
  };
}
