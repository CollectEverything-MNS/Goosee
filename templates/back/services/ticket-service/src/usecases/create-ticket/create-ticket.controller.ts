import { Body, Controller, Post } from '@nestjs/common';
import { CreateTicketUseCase } from './create-ticket.usecase';
import { CreateTicketDto } from './create-ticket.dto';

@Controller('tickets')
export class CreateTicketController {
  constructor(private readonly createTicketUseCase: CreateTicketUseCase) {}

  @Post()
  async create(@Body() dto: CreateTicketDto) {
    return this.createTicketUseCase.execute(dto);
  }
}
