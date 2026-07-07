import * as bcrypt from 'bcryptjs';
import { CreateEventUseCase } from './create-event.usecase';
import { InMemoryEventRepository } from '../testing/in-memory-event.repository';

describe('CreateEventUseCase', () => {
  let eventRepository: InMemoryEventRepository;
  let useCase: CreateEventUseCase;

  beforeEach(() => {
    eventRepository = new InMemoryEventRepository();
    useCase = new CreateEventUseCase(eventRepository);
  });

  it('creates a DRAFT event and persists it', async () => {
    const event = await useCase.execute({
      organizerId: 'organizer-1',
      name: 'Annual Conference',
      description: 'A yearly gathering',
      startDate: new Date('2026-09-01T09:00:00.000Z'),
      endDate: new Date('2026-09-02T18:00:00.000Z'),
      capacity: 100,
    });

    expect(event.status).toBe('DRAFT');
    expect(event.organizerId).toBe('organizer-1');
    expect(event.capacity.max).toBe(100);
    await expect(eventRepository.findById(event.id)).resolves.toBe(event);
  });

  it('defaults description to null when not provided', async () => {
    const event = await useCase.execute({
      organizerId: 'organizer-1',
      name: 'Meetup',
      startDate: new Date('2026-09-01T09:00:00.000Z'),
      endDate: new Date('2026-09-02T18:00:00.000Z'),
      capacity: 10,
    });

    expect(event.description).toBeNull();
  });

  it('leaves passHash null when no pass is provided', async () => {
    const event = await useCase.execute({
      organizerId: 'organizer-1',
      name: 'Meetup',
      startDate: new Date('2026-09-01T09:00:00.000Z'),
      endDate: new Date('2026-09-02T18:00:00.000Z'),
      capacity: 10,
    });

    expect(event.passHash).toBeNull();
    expect(event.hasPass()).toBe(false);
  });

  it('hashes the provided pass', async () => {
    const event = await useCase.execute({
      organizerId: 'organizer-1',
      name: 'Invite-only Meetup',
      pass: 'secret-pass',
      startDate: new Date('2026-09-01T09:00:00.000Z'),
      endDate: new Date('2026-09-02T18:00:00.000Z'),
      capacity: 10,
    });

    expect(event.hasPass()).toBe(true);
    expect(event.passHash).not.toBe('secret-pass');
    await expect(bcrypt.compare('secret-pass', event.passHash!)).resolves.toBe(
      true,
    );
  });
});
