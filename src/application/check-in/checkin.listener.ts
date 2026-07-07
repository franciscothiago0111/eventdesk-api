import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENT_NAMES } from '../../infrastructure/events/event-names.constant';
import { EventsGateway } from '../../infrastructure/websocket/events.gateway';
import { AttendeeCheckedIn } from '../../domain/check-in/events/attendee-checked-in.event';

@Injectable()
export class CheckinListener {
  constructor(private readonly eventsGateway: EventsGateway) {}

  @OnEvent(EVENT_NAMES.ATTENDEE_CHECKED_IN)
  onAttendeeCheckedIn(payload: AttendeeCheckedIn) {
    this.eventsGateway.emitCheckInRecorded(payload.eventId, {
      checkInId: payload.checkInId,
      registrationId: payload.registrationId,
      checkedInById: payload.checkedInById,
      fromOfflineSync: payload.fromOfflineSync,
    });
  }
}
