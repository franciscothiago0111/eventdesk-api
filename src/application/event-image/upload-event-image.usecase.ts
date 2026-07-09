import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EVENT_REPOSITORY } from '../../domain/event/event.repository';
import type { EventRepository } from '../../domain/event/event.repository';
import { EVENT_IMAGE_REPOSITORY } from '../../domain/event-image/event-image.repository';
import type { EventImageRepository } from '../../domain/event-image/event-image.repository';
import {
  EventImageAggregate,
  EventImageType,
} from '../../domain/event-image/event-image.aggregate';
import { STORAGE_PORT } from '../../domain/shared/storage.port';
import type { StoragePort } from '../../domain/shared/storage.port';

export interface UploadEventImageParams {
  eventId: string;
  organizerId: string;
  type: EventImageType;
  caption?: string | null;
  file: {
    buffer: Buffer;
    filename: string;
    contentType?: string;
  };
}

@Injectable()
export class UploadEventImageUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    @Inject(EVENT_IMAGE_REPOSITORY)
    private readonly eventImageRepository: EventImageRepository,
    @Inject(STORAGE_PORT) private readonly storagePort: StoragePort,
  ) {}

  async execute(params: UploadEventImageParams): Promise<EventImageAggregate> {
    const event = await this.eventRepository.findById(params.eventId);
    if (!event || event.organizerId !== params.organizerId) {
      throw new NotFoundException('Event not found');
    }

    if (params.type !== 'GALLERY') {
      const existing = await this.eventImageRepository.findByEventAndType(
        params.eventId,
        params.type,
      );
      if (existing) {
        await this.storagePort.delete(existing.key);
        await this.eventImageRepository.delete(existing.id);
      }
    }

    const uploaded = await this.storagePort.upload({
      buffer: params.file.buffer,
      filename: params.file.filename,
      contentType: params.file.contentType,
      folder: `events/${params.eventId}`,
    });

    const image = EventImageAggregate.create({
      id: randomUUID(),
      eventId: params.eventId,
      url: uploaded.url,
      key: uploaded.key,
      type: params.type,
      caption: params.caption ?? null,
      createdAt: new Date(),
    });

    await this.eventImageRepository.save(image);
    return image;
  }
}
