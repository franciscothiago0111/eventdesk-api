import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CheckInRepository } from '../../domain/check-in/check-in.repository';
import { CheckInAggregate } from '../../domain/check-in/check-in.aggregate';

@Injectable()
export class PrismaCheckInRepository implements CheckInRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(checkIn: CheckInAggregate): Promise<void> {
    await this.prisma.checkIn.create({
      data: {
        id: checkIn.id,
        registrationId: checkIn.registrationId,
        checkedInById: checkIn.checkedInById,
        checkedInAt: checkIn.checkedInAt,
        fromOfflineSync: checkIn.fromOfflineSync,
      },
    });
  }

  async existsForRegistration(registrationId: string): Promise<boolean> {
    const count = await this.prisma.checkIn.count({
      where: { registrationId },
    });
    return count > 0;
  }

  async countForEvent(eventId: string): Promise<number> {
    return this.prisma.checkIn.count({
      where: { registration: { eventId } },
    });
  }
}
