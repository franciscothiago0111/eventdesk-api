import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RecordCheckInDto {
  @ApiProperty({ description: 'Unique check-in code assigned to the registration' })
  @IsString()
  checkInCode: string;
}
