import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UpdateEventUseCase } from './update-event.usecase';
import { InMemoryEventRepository } from '../testing/in-memory-event.repository';
import { EventAggregate } from '../../domain/event/event.aggregate';
import { DateRange } from '../../domain/event/date-range.vo';
import { Capacity } from '../../domain/event/capacity.vo';
import { EventNotEditableError } from '../../domain/shared/domain-error';

function buildEvent(status: EventAggregate['status'] = 'DRAFT') {
  return EventAggregate.create({
    id: 'event-1',
    organizerId: 'organizer-1',
    name: 'Annual Conference',
    description: null,
    location: null,
    category: 'OTHER',
    passHash: null,
    dateRange: DateRange.create(
      new Date('2026-09-01T09:00:00.000Z'),
      new Date('2026-09-02T18:00:00.000Z'),
    ),
    capacity: Capacity.create(100),
    status,
  });
}

describe('UpdateEventUseCase', () => {
  let eventRepository: InMemoryEventRepository;
  let useCase: UpdateEventUseCase;

  beforeEach(() => {
    eventRepository = new InMemoryEventRepository();
    useCase = new UpdateEventUseCase(eventRepository);
  });

  it('updates a DRAFT event details', async () => {
    const event = buildEvent();
    await eventRepository.save(event);

    const updated = await useCase.execute({
      id: event.id,
      organizerId: event.organizerId,
      name: 'Updated Conference',
      category: 'OTHER',
      description: 'Updated description',
      startDate: new Date('2026-10-01T09:00:00.000Z'),
      endDate: new Date('2026-10-02T18:00:00.000Z'),
      capacity: 50,
    });

    expect(updated.name).toBe('Updated Conference');
    expect(updated.description).toBe('Updated description');
    expect(updated.capacity.max).toBe(50);
  });

  it('rejects updating an event belonging to a different organizer', async () => {
    const event = buildEvent();
    await eventRepository.save(event);

    await expect(
      useCase.execute({
        id: event.id,
        organizerId: 'someone-else',
        name: 'Updated Conference',
      category: 'OTHER',
        startDate: new Date('2026-10-01T09:00:00.000Z'),
        endDate: new Date('2026-10-02T18:00:00.000Z'),
        capacity: 50,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects updating an unknown event', async () => {
    await expect(
      useCase.execute({
        id: 'unknown',
        organizerId: 'organizer-1',
        name: 'Updated Conference',
      category: 'OTHER',
        startDate: new Date('2026-10-01T09:00:00.000Z'),
        endDate: new Date('2026-10-02T18:00:00.000Z'),
        capacity: 50,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects editing a non-DRAFT event', async () => {
    const event = buildEvent('PUBLISHED');
    await eventRepository.save(event);

    await expect(
      useCase.execute({
        id: event.id,
        organizerId: event.organizerId,
        name: 'Updated Conference',
      category: 'OTHER',
        startDate: new Date('2026-10-01T09:00:00.000Z'),
        endDate: new Date('2026-10-02T18:00:00.000Z'),
        capacity: 50,
      }),
    ).rejects.toThrow(EventNotEditableError);
  });

  it('leaves passHash unchanged when pass is omitted', async () => {
    const event = buildEvent();
    event.setPassHash('existing-hash');
    await eventRepository.save(event);

    const updated = await useCase.execute({
      id: event.id,
      organizerId: event.organizerId,
      name: 'Updated Conference',
      category: 'OTHER',
      startDate: new Date('2026-10-01T09:00:00.000Z'),
      endDate: new Date('2026-10-02T18:00:00.000Z'),
      capacity: 50,
    });

    expect(updated.passHash).toBe('existing-hash');
  });

  it('hashes a new pass when provided', async () => {
    const event = buildEvent();
    await eventRepository.save(event);

    const updated = await useCase.execute({
      id: event.id,
      organizerId: event.organizerId,
      name: 'Updated Conference',
      category: 'OTHER',
      pass: 'new-pass',
      startDate: new Date('2026-10-01T09:00:00.000Z'),
      endDate: new Date('2026-10-02T18:00:00.000Z'),
      capacity: 50,
    });

    expect(updated.hasPass()).toBe(true);
    await expect(bcrypt.compare('new-pass', updated.passHash!)).resolves.toBe(
      true,
    );
  });

  it('clears the pass when an empty string is provided', async () => {
    const event = buildEvent();
    event.setPassHash('existing-hash');
    await eventRepository.save(event);

    const updated = await useCase.execute({
      id: event.id,
      organizerId: event.organizerId,
      name: 'Updated Conference',
      category: 'OTHER',
      pass: '',
      startDate: new Date('2026-10-01T09:00:00.000Z'),
      endDate: new Date('2026-10-02T18:00:00.000Z'),
      capacity: 50,
    });

    expect(updated.hasPass()).toBe(false);
  });
});
