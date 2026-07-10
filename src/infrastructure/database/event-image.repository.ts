import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { EventImageRepository } from '../../domain/event-image/event-image.repository';
import { EventImageAggregate } from '../../domain/event-image/event-image.aggregate';
import { EventImage as PrismaEventImage } from '../../generated/prisma/client';

@Injectable()
export class PrismaEventImageRepository implements EventImageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(image: EventImageAggregate): Promise<void> {
    await this.prisma.eventImage.upsert({
      where: { id: image.id },
      create: {
        id: image.id,
        eventId: image.eventId,
        url: image.url,
        key: image.key,
        type: image.type,
        caption: image.caption,
      },
      update: {
        url: image.url,
        key: image.key,
        caption: image.caption,
      },
    });
  }

  async findById(id: string): Promise<EventImageAggregate | null> {
    const image = await this.prisma.eventImage.findUnique({ where: { id } });
    return image ? this.toDomain(image) : null;
  }

  async findByEventAndType(
    eventId: string,
    type: EventImageAggregate['type'],
  ): Promise<EventImageAggregate | null> {
    const image = await this.prisma.eventImage.findFirst({
      where: { eventId, type },
    });
    return image ? this.toDomain(image) : null;
  }

  async findByEvent(eventId: string): Promise<EventImageAggregate[]> {
    const images = await this.prisma.eventImage.findMany({
      where: { eventId },
      orderBy: { createdAt: 'asc' },
    });
    return images.map((image) => this.toDomain(image));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.eventImage.delete({ where: { id } });
  }

  private toDomain(image: PrismaEventImage): EventImageAggregate {
    return EventImageAggregate.create({
      id: image.id,
      eventId: image.eventId,
      url: image.url,
      key: image.key,
      type: image.type,
      caption: image.caption,
      createdAt: image.createdAt,
    });
  }
}
