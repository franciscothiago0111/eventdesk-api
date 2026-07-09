import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { EVENT_REPOSITORY } from '../../domain/event/event.repository';
import type { EventRepository } from '../../domain/event/event.repository';
import { EventAggregate } from '../../domain/event/event.aggregate';
import { DateRange } from '../../domain/event/date-range.vo';
import { Capacity } from '../../domain/event/capacity.vo';
import { EventCategory } from '../../domain/event/event.aggregate';

export interface CreateEventParams {
  organizerId: string;
  name: string;
  description?: string | null;
  location?: string | null;
  category?: EventCategory;
  pass?: string | null;
  startDate: Date;
  endDate: Date;
  capacity: number;
}

@Injectable()
export class CreateEventUseCase {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
  ) {}

  async execute(params: CreateEventParams): Promise<EventAggregate> {
    const passHash = params.pass ? await bcrypt.hash(params.pass, 10) : null;

    const event = EventAggregate.create({
      id: randomUUID(),
      organizerId: params.organizerId,
      name: params.name,
      description: params.description ?? null,
      location: params.location ?? null,
      category: params.category ?? 'OTHER',
      passHash,
      dateRange: DateRange.create(params.startDate, params.endDate),
      capacity: Capacity.create(params.capacity),
      status: 'DRAFT',
    });

    await this.eventRepository.save(event);
    return event;
  }
}
