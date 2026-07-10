import { Global, Module } from '@nestjs/common';
import { STORAGE_PORT } from '../../domain/shared/storage.port';
import { MinioAdapter } from './minio.adapter';

@Global()
@Module({
  providers: [{ provide: STORAGE_PORT, useClass: MinioAdapter }],
  exports: [STORAGE_PORT],
})
export class StorageModule {}
