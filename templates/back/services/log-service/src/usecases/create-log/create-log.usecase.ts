import { Injectable, Logger } from '@nestjs/common';
import { ILogRepository } from '../../repositories/log.repository';
import { Log, LogLevel } from '../../entities/log.entity';

export type CreateLogPayload = {
  service?: string;
  level?: LogLevel;
  message: string;
  userId?: string;
  categorie?: string;
};

@Injectable()
export class CreateLogUseCase {
  private readonly logger = new Logger(CreateLogUseCase.name);

  constructor(private readonly logRepo: ILogRepository) {}

  async execute(payload: CreateLogPayload): Promise<void> {
    if (!payload?.message) {
      this.logger.warn('Log ignoré : message manquant');
      return;
    }

    const log = new Log();
    log.service = payload.service;
    log.level = payload.level;
    log.message = payload.message;
    log.userId = payload.userId;
    log.categorie = payload.categorie ?? null;

    await this.logRepo.save(log);
  }
}
