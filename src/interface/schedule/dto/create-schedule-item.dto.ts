import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateScheduleItemDto {
  @ApiProperty({ example: 'Opening keynote' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Welcome remarks and agenda overview' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-09-01T09:00:00.000Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2026-09-01T09:30:00.000Z' })
  @IsDateString()
  endTime: string;
}
