import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { EVENT_REPOSITORY } from '../../domain/event/event.repository';
import type { EventRepository } from '../../domain/event/event.repository';
import { EventAggregate } from '../../domain/event/event.aggregate';
import { DateRange } from '../../domain/event/date-range.vo';
import { Capacity } from '../../domain/event/capacity.vo';

export interface UpdateEventParams {
  id: string;
  organizerId: string;
  name: string;
  description?: string | null;
  location?: string | null;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
  pass?: string | null;
  startDate: Date;
  endDate: Date;
  capacity: number;
}

@Injectable()
export class UpdateEventUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
  ) {}

  async execute(params: UpdateEventParams): Promise<EventAggregate> {
    const event = await this.eventRepository.findById(params.id);
    if (!event || event.organizerId !== params.organizerId) {
      throw new NotFoundException('Event not found');
    }

    event.updateDetails({
      name: params.name,
      description: params.description ?? null,
      location: params.location ?? null,
      profileImageUrl: params.profileImageUrl ?? null,
      coverImageUrl: params.coverImageUrl ?? null,
      dateRange: DateRange.create(params.startDate, params.endDate),
      capacity: Capacity.create(params.capacity, event.capacity.current),
    });

    if (params.pass !== undefined) {
      event.setPassHash(
        params.pass ? await bcrypt.hash(params.pass, 10) : null,
      );
    }

    await this.eventRepository.save(event);
    return event;
  }
}
