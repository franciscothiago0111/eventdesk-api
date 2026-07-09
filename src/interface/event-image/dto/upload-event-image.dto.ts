import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EventImageType } from '../../../../generated/prisma/client';

export class UploadEventImageDto {
  @ApiProperty({ enum: EventImageType, example: EventImageType.COVER })
  @IsEnum(EventImageType)
  type: EventImageType;

  @ApiPropertyOptional({ example: 'Opening keynote stage' })
  @IsOptional()
  @IsString()
  caption?: string;
}
