import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

export enum LogLevel {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  DEBUG = 'DEBUG',
}

export type EmitLogPayload = {
  message: string;
  userId?: string;
};

const SERVICE_NAME = 'user-service';

@Injectable()
export class LogClient {
  private readonly logger = new Logger(LogClient.name);

  constructor(@Inject('LOG_CLIENT') private readonly client: ClientProxy) {}

  info(payload: EmitLogPayload) {
    this.emit(LogLevel.INFO, payload);
  }

  success(payload: EmitLogPayload) {
    this.emit(LogLevel.SUCCESS, payload);
  }

  warning(payload: EmitLogPayload) {
    this.emit(LogLevel.WARNING, payload);
  }

  error(payload: EmitLogPayload) {
    this.emit(LogLevel.ERROR, payload);
  }

  critical(payload: EmitLogPayload) {
    this.emit(LogLevel.CRITICAL, payload);
  }

  debug(payload: EmitLogPayload) {
    this.emit(LogLevel.DEBUG, payload);
  }

  private emit(level: LogLevel, payload: EmitLogPayload) {
    try {
      this.client.emit('log.created', {
        service: SERVICE_NAME,
        level,
        message: payload.message,
        userId: payload.userId,
      });
    } catch (err) {
      this.logger.error(
        `Échec de l'émission du log : ${(err as Error).message}`
      );
    }
  }
}
