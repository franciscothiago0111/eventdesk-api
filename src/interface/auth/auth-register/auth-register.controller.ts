import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RegisterOrganizerUseCase } from '../../../application/auth/register-organizer.usecase';
import { ApiResponseService } from '../../../shared/services/api-response.service';
import { Public } from '../../../shared/decorators/public.decorator';
import { RegisterOrganizerDto } from './dto/register-organizer.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthRegisterController {
  constructor(
    private readonly registerOrganizerUseCase: RegisterOrganizerUseCase,
    private readonly apiResponse: ApiResponseService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterOrganizerDto) {
    const result = await this.registerOrganizerUseCase.execute(dto);
    return this.apiResponse.success('Organizer registered', result);
  }
}
