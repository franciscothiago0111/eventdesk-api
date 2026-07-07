import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreatePublicRegistrationDto {
  @ApiProperty({ example: 'John Smith' })
  @IsString()
  attendeeName: string;

  @ApiProperty({ example: 'john.smith@example.com' })
  @IsEmail()
  attendeeEmail: string;

  @ApiPropertyOptional({
    example: 'let-me-in',
    description: 'Required only when the event has an access pass set.',
  })
  @IsOptional()
  @IsString()
  pass?: string;
}
