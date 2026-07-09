import { Global, Module } from '@nestjs/common';
import { STORAGE_PORT } from '../../domain/shared/storage.port';
import { CloudflareR2Adapter } from './cloudflare-r2.adapter';

@Global()
@Module({
  providers: [{ provide: STORAGE_PORT, useClass: CloudflareR2Adapter }],
  exports: [STORAGE_PORT],
})
export class StorageModule {}
