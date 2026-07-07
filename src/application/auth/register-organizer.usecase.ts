import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class RegisterOrganizerUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: { name: string; email: string; password: string }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: params.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(params.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: params.name,
        email: params.email,
        passwordHash,
        role: 'ORGANIZER',
      },
    });

    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }
}
