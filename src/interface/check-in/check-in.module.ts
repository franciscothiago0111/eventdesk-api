import { Module } from '@nestjs/common';
import { CheckInController } from './check-in.controller';
import { RecordCheckInUseCase } from '../../application/check-in/record-check-in.usecase';
import { SyncOfflineCheckInsUseCase } from '../../application/check-in/sync-offline-check-ins.usecase';
import { CheckinListener } from '../../application/check-in/checkin.listener';
import { CHECK_IN_REPOSITORY } from '../../domain/check-in/check-in.repository';
import { PrismaCheckInRepository } from '../../infrastructure/database/check-in.repository';
import { REGISTRATION_REPOSITORY } from '../../domain/registration/registration.repository';
import { PrismaRegistrationRepository } from '../../infrastructure/database/registration.repository';
import { EventDispatcherService } from '../../infrastructure/events/event-dispatcher.service';
import { WebsocketModule } from '../../infrastructure/websocket/websocket.module';
import { ApiResponseService } from '../../shared/services/api-response.service';

@Module({
  imports: [WebsocketModule],
  controllers: [CheckInController],
  providers: [
    RecordCheckInUseCase,
    SyncOfflineCheckInsUseCase,
    CheckinListener,
    EventDispatcherService,
    ApiResponseService,
    { provide: CHECK_IN_REPOSITORY, useClass: PrismaCheckInRepository },
    {
      provide: REGISTRATION_REPOSITORY,
      useClass: PrismaRegistrationRepository,
    },
  ],
})
export class CheckInModule {}
