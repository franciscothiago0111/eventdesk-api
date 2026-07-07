import { Module } from '@nestjs/common';
import { QueueModule } from '../../infrastructure/queue/queue.module';
import { RegistrationController } from './registration.controller';
import { ConfirmRegistrationUseCase } from '../../application/registration/confirm-registration.usecase';
import { CancelRegistrationUseCase } from '../../application/registration/cancel-registration.usecase';
import { ListRegistrationsByEventUseCase } from '../../application/registration/list-registrations-by-event.usecase';
import { RegistrationListener } from '../../application/registration/registration.listener';
import { REGISTRATION_REPOSITORY } from '../../domain/registration/registration.repository';
import { PrismaRegistrationRepository } from '../../infrastructure/database/registration.repository';
import { EVENT_REPOSITORY } from '../../domain/event/event.repository';
import { PrismaEventRepository } from '../../infrastructure/database/event.repository';
import { EventDispatcherService } from '../../infrastructure/events/event-dispatcher.service';
import { ApiResponseService } from '../../shared/services/api-response.service';

@Module({
  imports: [QueueModule],
  controllers: [RegistrationController],
  providers: [
    ConfirmRegistrationUseCase,
    CancelRegistrationUseCase,
    ListRegistrationsByEventUseCase,
    RegistrationListener,
    EventDispatcherService,
    ApiResponseService,
    {
      provide: REGISTRATION_REPOSITORY,
      useClass: PrismaRegistrationRepository,
    },
    { provide: EVENT_REPOSITORY, useClass: PrismaEventRepository },
  ],
})
export class RegistrationModule {}
