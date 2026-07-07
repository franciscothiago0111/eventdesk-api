import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';

export class OfflineCheckInItemDto {
  @ApiProperty({
    description: 'Unique check-in code assigned to the registration',
  })
  @IsString()
  checkInCode: string;
}

export class SyncOfflineCheckInsDto {
  @ApiProperty({
    type: () => OfflineCheckInItemDto,
    isArray: true,
    minItems: 1,
    description: 'Check-ins recorded while offline, to be synced',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OfflineCheckInItemDto)
  items: OfflineCheckInItemDto[];
}
