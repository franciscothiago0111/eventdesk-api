import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import type { EventStatus } from '../../../../domain/event/event.aggregate';

const EVENT_STATUSES: EventStatus[] = [
  'DRAFT',
  'PUBLISHED',
  'CLOSED',
  'CANCELLED',
];

export class ListEventsDto {
  @ApiPropertyOptional({ example: 'Conference' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: EVENT_STATUSES })
  @IsOptional()
  @IsIn(EVENT_STATUSES)
  status?: EventStatus;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
