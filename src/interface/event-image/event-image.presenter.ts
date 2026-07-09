import { EventImageAggregate } from '../../domain/event-image/event-image.aggregate';

export function presentEventImage(image: EventImageAggregate) {
  return {
    id: image.id,
    url: image.url,
    type: image.type,
    caption: image.caption,
    createdAt: image.createdAt,
  };
}
