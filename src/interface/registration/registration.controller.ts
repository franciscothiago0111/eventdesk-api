import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConfirmRegistrationUseCase } from '../../application/registration/confirm-registration.usecase';
import { CancelRegistrationUseCase } from '../../application/registration/cancel-registration.usecase';
import { ListRegistrationsByEventUseCase } from '../../application/registration/list-registrations-by-event.usecase';
import { ApiResponseService } from '../../shared/services/api-response.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../shared/decorators/current-user.decorator';
import { Permissions } from '../../shared/decorators/permissions.decorator';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { presentRegistration } from './registration.presenter';

@ApiTags('registrations')
@ApiBearerAuth()
@Controller()
export class RegistrationController {
  constructor(
    private readonly confirmRegistrationUseCase: ConfirmRegistrationUseCase,
    private readonly cancelRegistrationUseCase: CancelRegistrationUseCase,
    private readonly listRegistrationsByEventUseCase: ListRegistrationsByEventUseCase,
    private readonly apiResponse: ApiResponseService,
  ) {}

  @Permissions('ORGANIZER')
  @Post('events/:eventId/registrations')
  async create(
    @Param('eventId') eventId: string,
    @Body() dto: CreateRegistrationDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const registration = await this.confirmRegistrationUseCase.execute({
      eventId,
      organizerId: user.organizerId,
      attendeeName: dto.attendeeName,
      attendeeEmail: dto.attendeeEmail,
    });
    return this.apiResponse.success(
      'Registration confirmed',
      presentRegistration(registration),
    );
  }

  @Permissions('ORGANIZER')
  @Get('events/:eventId/registrations')
  async list(
    @Param('eventId') eventId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const registrations = await this.listRegistrationsByEventUseCase.execute({
      eventId,
      organizerId: user.organizerId,
    });
    return this.apiResponse.success(
      'Registrations retrieved',
      registrations.map(presentRegistration),
    );
  }

  @Permissions('ORGANIZER')
  @Patch('registrations/:id/cancel')
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const registration = await this.cancelRegistrationUseCase.execute({
      id,
      organizerId: user.organizerId,
    });
    return this.apiResponse.success(
      'Registration cancelled',
      presentRegistration(registration),
    );
  }
}
