import { Inject, Injectable, Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { QUEUE_NAMES } from '../../infrastructure/queue/queue-names.constant';
import { EMAIL_PORT } from '../../domain/shared/email.port';
import type { EmailPort } from '../../domain/shared/email.port';
import { EmailTemplateService } from '../../infrastructure/email/email-template.service';
import { EVENT_REPOSITORY } from '../../domain/event/event.repository';
import type { EventRepository } from '../../domain/event/event.repository';
import { ConfirmationEmailJob } from './email.job';

@Injectable()
@Processor(QUEUE_NAMES.EMAIL)
export class RegistrationEmailProcessor {
  private readonly logger = new Logger(RegistrationEmailProcessor.name);

  constructor(
    @Inject(EMAIL_PORT) private readonly emailPort: EmailPort,
    private readonly emailTemplateService: EmailTemplateService,
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
  ) {}

  @Process('confirmation-email')
  async handleConfirmationEmail(job: Job<ConfirmationEmailJob>) {
    const {
      eventId,
      attendeeName,
      attendeeEmail,
      checkInCode,
      registrationId,
    } = job.data;

    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      this.logger.warn(
        `Evento ${eventId} não encontrado ao enviar email de confirmação da inscrição ${registrationId}.`,
      );
      return;
    }

    const html = this.emailTemplateService.render('confirmation-email', {
      attendeeName,
      eventName: event.name,
      eventLocation: event.location,
      eventStartDate: event.dateRange.startDate.toLocaleString('pt-BR', {
        dateStyle: 'long',
        timeStyle: 'short',
      }),
      checkInCode,
    });

    await this.emailPort.send({
      to: attendeeEmail,
      subject: `Inscrição confirmada: ${event.name}`,
      html,
    });

    return { registrationId };
  }
}
