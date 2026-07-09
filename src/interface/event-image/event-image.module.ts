import { Module } from '@nestjs/common';
import { EventImageController } from './event-image.controller';
import { UploadEventImageUseCase } from '../../application/event-image/upload-event-image.usecase';
import { DeleteEventImageUseCase } from '../../application/event-image/delete-event-image.usecase';
import { EVENT_IMAGE_REPOSITORY } from '../../domain/event-image/event-image.repository';
import { PrismaEventImageRepository } from '../../infrastructure/database/event-image.repository';
import { EVENT_REPOSITORY } from '../../domain/event/event.repository';
import { PrismaEventRepository } from '../../infrastructure/database/event.repository';
import { ApiResponseService } from '../../shared/services/api-response.service';

@Module({
  controllers: [EventImageController],
  providers: [
    UploadEventImageUseCase,
    DeleteEventImageUseCase,
    ApiResponseService,
    { provide: EVENT_IMAGE_REPOSITORY, useClass: PrismaEventImageRepository },
    { provide: EVENT_REPOSITORY, useClass: PrismaEventRepository },
  ],
})
export class EventImageModule {}
