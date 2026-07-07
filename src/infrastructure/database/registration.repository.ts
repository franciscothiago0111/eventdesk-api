import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RegistrationRepository } from '../../domain/registration/registration.repository';
import { RegistrationAggregate } from '../../domain/registration/registration.aggregate';
import { CheckInCode } from '../../domain/registration/check-in-code.vo';
import { Registration as PrismaRegistration } from '../../../generated/prisma/client';

@Injectable()
export class PrismaRegistrationRepository implements RegistrationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(registration: RegistrationAggregate): Promise<void> {
    await this.prisma.registration.upsert({
      where: { id: registration.id },
      create: {
        id: registration.id,
        eventId: registration.eventId,
        attendeeName: registration.attendeeName,
        attendeeEmail: registration.attendeeEmail,
        checkInCode: registration.checkInCode.value,
        status: registration.status,
      },
      update: {
        attendeeName: registration.attendeeName,
        attendeeEmail: registration.attendeeEmail,
        status: registration.status,
      },
    });
  }

  async findById(id: string): Promise<RegistrationAggregate | null> {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
    });
    return registration ? this.toDomain(registration) : null;
  }

  async findByCheckInCode(code: string): Promise<RegistrationAggregate | null> {
    const registration = await this.prisma.registration.findUnique({
      where: { checkInCode: code },
    });
    return registration ? this.toDomain(registration) : null;
  }

  async findByEvent(eventId: string): Promise<RegistrationAggregate[]> {
    const registrations = await this.prisma.registration.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
    });
    return registrations.map((registration) => this.toDomain(registration));
  }

  private toDomain(registration: PrismaRegistration): RegistrationAggregate {
    return RegistrationAggregate.rehydrate({
      id: registration.id,
      eventId: registration.eventId,
      attendeeName: registration.attendeeName,
      attendeeEmail: registration.attendeeEmail,
      checkInCode: CheckInCode.fromExisting(registration.checkInCode),
      status: registration.status,
    });
  }
}
