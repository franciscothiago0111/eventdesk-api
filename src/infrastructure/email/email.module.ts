import { Global, Module } from '@nestjs/common';
import { EMAIL_PORT } from '../../domain/shared/email.port';
import { ResendAdapter } from './resend.adapter';
import { EmailTemplateService } from './email-template.service';

@Global()
@Module({
  providers: [
    { provide: EMAIL_PORT, useClass: ResendAdapter },
    EmailTemplateService,
  ],
  exports: [EMAIL_PORT, EmailTemplateService],
})
export class EmailModule {}
