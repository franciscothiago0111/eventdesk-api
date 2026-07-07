import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EVENT_NAMES } from '../../infrastructure/events/event-names.constant';
import { EventPublished } from '../../domain/event/events/event-published.event';
import { EventClosed } from '../../domain/event/events/event-closed.event';

@Injectable()
export class EventListener {
  private readonly logger = new Logger('AuditLog');

  @OnEvent(EVENT_NAMES.EVENT_PUBLISHED)
  onEventPublished(payload: EventPublished) {
    this.logger.log(
      `event.published eventId=${payload.eventId} organizerId=${payload.organizerId}`,
    );
  }

  @OnEvent(EVENT_NAMES.EVENT_CLOSED)
  onEventClosed(payload: EventClosed) {
    this.logger.log(
      `event.closed eventId=${payload.eventId} organizerId=${payload.organizerId}`,
    );
  }
}
