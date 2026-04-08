import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ListLogsUseCase } from './list-logs.usecase';

@Controller()
export class ListLogsController {
  constructor(private readonly listLogsUseCase: ListLogsUseCase) {}

  @MessagePattern('log.list')
  async listLogs() {
    return this.listLogsUseCase.execute();
  }
}
