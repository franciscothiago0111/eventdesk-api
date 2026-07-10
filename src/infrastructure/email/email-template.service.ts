import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import Handlebars from 'handlebars';

export type EmailTemplateName = 'confirmation-email';

const TEMPLATE_NAMES: EmailTemplateName[] = ['confirmation-email'];

@Injectable()
export class EmailTemplateService {
  private readonly templates = new Map<
    EmailTemplateName,
    HandlebarsTemplateDelegate
  >();

  constructor() {
    for (const name of TEMPLATE_NAMES) {
      const source = readFileSync(
        join(__dirname, 'templates', `${name}.hbs`),
        'utf-8',
      );
      this.templates.set(name, Handlebars.compile(source));
    }
  }

  render(name: EmailTemplateName, context: Record<string, unknown>): string {
    const template = this.templates.get(name);
    if (!template) {
      throw new Error(`Template de email "${name}" não encontrado.`);
    }
    return template(context);
  }
}
