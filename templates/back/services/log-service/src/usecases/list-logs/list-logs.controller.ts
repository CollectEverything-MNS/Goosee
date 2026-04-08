import { Controller, Get } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ListLogsUseCase } from './list-logs.usecase';

@Controller('logs')
export class ListLogsController {
  constructor(private readonly listLogsUseCase: ListLogsUseCase) {}

  @Get()
  async listLogsHttp() {
    return this.listLogsUseCase.execute();
  }

  @MessagePattern('log.list')
  async listLogs() {
    return this.listLogsUseCase.execute();
  }
}
