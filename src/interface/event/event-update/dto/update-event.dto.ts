import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateEventDto {
  @ApiProperty({ example: 'Tech Conference 2026' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'An annual gathering of tech enthusiasts' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-09-01T09:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-09-01T18:00:00.000Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ minimum: 1, example: 100 })
  @IsInt()
  @Min(1)
  capacity: number;
}
