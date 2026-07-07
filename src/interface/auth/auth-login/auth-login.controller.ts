import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginUseCase } from '../../../application/auth/login.usecase';
import { ApiResponseService } from '../../../shared/services/api-response.service';
import { Public } from '../../../shared/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthLoginController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly apiResponse: ApiResponseService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const result = await this.loginUseCase.execute(dto.email, dto.password);
    return this.apiResponse.success('Login successful', result);
  }
}
