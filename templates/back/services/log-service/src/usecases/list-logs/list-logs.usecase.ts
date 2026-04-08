import { Injectable } from '@nestjs/common';
import { ILogRepository } from '../../repositories/log.repository';

@Injectable()
export class ListLogsUseCase {
  constructor(private readonly logRepo: ILogRepository) {}

  async execute() {
    const logs = await this.logRepo.list();

    return {
      message: 'Logs fetched successfully',
      logs,
    };
  }
}
