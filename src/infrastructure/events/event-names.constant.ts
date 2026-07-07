export const EVENT_NAMES = {
  EVENT_PUBLISHED: 'event.published',
  EVENT_CLOSED: 'event.closed',
  REGISTRATION_CONFIRMED: 'registration.confirmed',
  REGISTRATION_CANCELLED: 'registration.cancelled',
  ATTENDEE_CHECKED_IN: 'checkin.recorded',
} as const;

export type EventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];
