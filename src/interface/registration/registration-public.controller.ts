import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConfirmRegistrationUseCase } from '../../application/registration/confirm-registration.usecase';
import { ApiResponseService } from '../../shared/services/api-response.service';
import { Public } from '../../shared/decorators/public.decorator';
import { CreatePublicRegistrationDto } from './dto/create-public-registration.dto';
import { presentRegistration } from './registration.presenter';

@ApiTags('public-registrations')
@Controller('public/events/:eventId/registrations')
export class RegistrationPublicController {
  constructor(
    private readonly confirmRegistrationUseCase: ConfirmRegistrationUseCase,
    private readonly apiResponse: ApiResponseService,
  ) {}

  @Public()
  @Post()
  async create(
    @Param('eventId') eventId: string,
    @Body() dto: CreatePublicRegistrationDto,
  ) {
    const registration = await this.confirmRegistrationUseCase.execute({
      eventId,
      attendeeName: dto.attendeeName,
      attendeeEmail: dto.attendeeEmail,
      pass: dto.pass,
    });
    return this.apiResponse.success(
      'Registration confirmed',
      presentRegistration(registration),
    );
  }
}
