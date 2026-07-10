import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { EmailPort, SendEmailInput } from '../../domain/shared/email.port';

@Injectable()
export class ResendAdapter implements EmailPort {
  private readonly logger = new Logger(ResendAdapter.name);
  private readonly client: Resend | null;
  private readonly from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.from = process.env.EMAIL_FROM ?? 'EventDesk <onboarding@resend.dev>';

    if (!apiKey) {
      this.logger.warn('Resend não configurado. Defina RESEND_API_KEY.');
      this.client = null;
    } else {
      this.client = new Resend(apiKey);
    }
  }

  async send(input: SendEmailInput): Promise<void> {
    if (!this.client) {
      this.logger.warn(
        `Email para ${input.to} não enviado: RESEND_API_KEY ausente.`,
      );
      return;
    }

    const { error } = await this.client.emails.send({
      from: this.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });

    if (error) {
      throw new Error(`Falha ao enviar email: ${error.message}`);
    }
  }
}
