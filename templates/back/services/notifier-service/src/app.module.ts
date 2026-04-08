import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotifierController } from './controllers/notifier.controller';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { PushService } from './services/push.service';
import { NotificationDispatcher } from './services/dispatcher/dispatcher.service';
import { LogClient } from './shared/log-client.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
      {
        name: 'LOG_CLIENT',
        inject: [ConfigService],
        useFactory: (cfg: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [cfg.get<string>('RABBITMQ_URL')!],
            queue: 'log_events',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [NotifierController],
  providers: [EmailService, SmsService, PushService, NotificationDispatcher, LogClient],
})
export class AppModule {}
