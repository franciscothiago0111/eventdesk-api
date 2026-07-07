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

  @ApiPropertyOptional({ example: 'Moscone Center, San Francisco' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/profile.png' })
  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/cover.png' })
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @ApiPropertyOptional({
    example: 'let-me-in',
    description:
      'Access code attendees must provide on the public registration page. Send an empty string to clear it, omit to leave unchanged.',
  })
  @IsOptional()
  @IsString()
  pass?: string;

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
