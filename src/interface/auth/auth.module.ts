import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthLoginController } from './auth-login/auth-login.controller';
import { AuthRegisterController } from './auth-register/auth-register.controller';
import { LoginUseCase } from '../../application/auth/login.usecase';
import { RegisterOrganizerUseCase } from '../../application/auth/register-organizer.usecase';
import { JwtStrategy } from '../../infrastructure/strategies/jwt.strategy';
import { ApiResponseService } from '../../shared/services/api-response.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET ?? 'change-me-in-local-env',
        signOptions: {
          expiresIn: (process.env.JWT_EXPIRES_IN ??
            '1d') as `${number}${'s' | 'm' | 'h' | 'd'}`,
        },
      }),
    }),
  ],
  controllers: [AuthLoginController, AuthRegisterController],
  providers: [
    LoginUseCase,
    RegisterOrganizerUseCase,
    JwtStrategy,
    ApiResponseService,
  ],
})
export class AuthModule {}
