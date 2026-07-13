import { Controller, Get, Param } from '@nestjs/common';
import { GetTicketUseCase } from './get-ticket.usecase';

@Controller('tickets')
export class GetTicketController {
  constructor(private readonly getTicketUseCase: GetTicketUseCase) {}

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.getTicketUseCase.execute(id);
  }
}
