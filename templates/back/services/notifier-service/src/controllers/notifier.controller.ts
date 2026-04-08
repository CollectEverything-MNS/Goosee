import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationDispatcher } from '../services/dispatcher/dispatcher.service';
import { NotificationPayload } from './notifier.dto';
import { LogClient } from '../shared/log-client.service';

@Controller()
export class NotifierController {
  private readonly logger = new Logger(NotifierController.name);

  constructor(
    private readonly dispatcher: NotificationDispatcher,
    private readonly logClient: LogClient,
  ) {}

  @EventPattern('send_notification')
  async handleNotification(@Payload() payload: NotificationPayload) {
    this.logger.log(`Received ${payload.type} notification event`);
    try {
      await this.dispatcher.dispatch(payload.type, payload.data);
      this.logClient.success({
        message: `Notification ${payload.type} envoyée avec succès`,
      });
    } catch (err) {
      this.logClient.error({
        message: `Échec de l'envoi de la notification ${payload.type} : ${(err as Error).message}`,
      });
      throw err;
    }
  }
}
