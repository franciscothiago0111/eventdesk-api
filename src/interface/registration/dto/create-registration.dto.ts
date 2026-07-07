import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateRegistrationDto {
  @ApiProperty({ example: 'John Smith' })
  @IsString()
  attendeeName: string;

  @ApiProperty({ example: 'john.smith@example.com' })
  @IsEmail()
  attendeeEmail: string;
}
