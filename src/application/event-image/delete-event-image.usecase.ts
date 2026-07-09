import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EVENT_REPOSITORY } from '../../domain/event/event.repository';
import type { EventRepository } from '../../domain/event/event.repository';
import { EVENT_IMAGE_REPOSITORY } from '../../domain/event-image/event-image.repository';
import type { EventImageRepository } from '../../domain/event-image/event-image.repository';
import { STORAGE_PORT } from '../../domain/shared/storage.port';
import type { StoragePort } from '../../domain/shared/storage.port';

@Injectable()
export class DeleteEventImageUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    @Inject(EVENT_IMAGE_REPOSITORY)
    private readonly eventImageRepository: EventImageRepository,
    @Inject(STORAGE_PORT) private readonly storagePort: StoragePort,
  ) {}

  async execute(params: {
    eventId: string;
    imageId: string;
    organizerId: string;
  }): Promise<void> {
    const event = await this.eventRepository.findById(params.eventId);
    if (!event || event.organizerId !== params.organizerId) {
      throw new NotFoundException('Event not found');
    }

    const image = await this.eventImageRepository.findById(params.imageId);
    if (!image || image.eventId !== params.eventId) {
      throw new NotFoundException('Image not found');
    }

    await this.storagePort.delete(image.key);
    await this.eventImageRepository.delete(image.id);
  }
}
