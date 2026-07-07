import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../generated/prisma/client';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...roles: Role[]) =>
  SetMetadata(PERMISSIONS_KEY, roles);
