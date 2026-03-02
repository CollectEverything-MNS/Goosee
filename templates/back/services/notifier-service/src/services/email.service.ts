import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { INotificationService } from '../interfaces/notification-service.interface';
import { EmailData } from '../types/email-data.type';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class EmailService implements INotificationService {
  private readonly logger = new Logger(EmailService.name);
  private transporter;

  constructor(private readonly config: ConfigService) {
    const smtpPort = Number(this.config.get('SMTP_PORT'));
    const smtpSecure = this.config.get('SMTP_SECURE') === 'true';
    const smtpUser = this.config.get('SMTP_USER');
    const smtpPassword = this.config.get('SMTP_PASSWORD');

    const transportOptions: SMTPTransport.Options = {
      host: this.config.get('SMTP_HOST'),
      port: smtpPort,
      secure: smtpSecure,
    };

    if (smtpUser && smtpPassword) {
      transportOptions.auth = {
        user: smtpUser,
        pass: smtpPassword,
      };
    }

    this.transporter = nodemailer.createTransport(transportOptions);
  }

  async send(email: EmailData): Promise<void> {
    try {
      const recipients = Array.isArray(email.to)
        ? email.to.join(', ')
        : email.to;

      const info = await this.transporter.sendMail({
        from: email.from || this.config.get('SMTP_FROM'),
        to: recipients,
        subject: email.subject,
        text: email.body,
        html: email.html,
      });

      this.logger.log(`Email sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed: ${error.message}`);
      throw error;
    }
  }
}
