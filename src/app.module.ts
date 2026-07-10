import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infrastructure/database/database.module';
import { QueueModule } from './infrastructure/queue/queue.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { EmailModule } from './infrastructure/email/email.module';
import { WebsocketModule } from './infrastructure/websocket/websocket.module';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { PermissionsGuard } from './infrastructure/guards/permissions.guard';
import { DomainErrorFilter } from './infrastructure/filters/domain-error.filter';
import { AuthModule } from './interface/auth/auth.module';
import { EventModule } from './interface/event/event.module';
import { RegistrationModule } from './interface/registration/registration.module';
import { CheckInModule } from './interface/check-in/check-in.module';
import { NotificationModule } from './interface/notification/notification.module';
import { EventImageModule } from './interface/event-image/event-image.module';
import { ScheduleModule } from './interface/schedule/schedule.module';
import { DashboardModule } from './interface/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    QueueModule,
    StorageModule,
    EmailModule,
    WebsocketModule,
    AuthModule,
    EventModule,
    RegistrationModule,
    CheckInModule,
    NotificationModule,
    EventImageModule,
    ScheduleModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_FILTER, useClass: DomainErrorFilter },
  ],
})
export class AppModule {}
