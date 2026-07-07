import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterOrganizerDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'organizer@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ minLength: 8, example: 'password123' })
  @IsString()
  @MinLength(8)
  password: string;
}
