import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QUEUE_NAMES } from './queue-names.constant';

export { QUEUE_NAMES };

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST ?? 'localhost',
          port: Number(process.env.REDIS_PORT ?? 6380),
        },
      }),
    }),
    BullModule.registerQueue({ name: QUEUE_NAMES.EMAIL }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
