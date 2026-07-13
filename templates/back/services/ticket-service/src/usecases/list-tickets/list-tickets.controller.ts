import { Controller, Get } from '@nestjs/common';
import { ListTicketsUseCase } from './list-tickets.usecase';

@Controller('tickets')
export class ListTicketsController {
  constructor(private readonly listTicketsUseCase: ListTicketsUseCase) {}

  @Get()
  async list() {
    return this.listTicketsUseCase.execute();
  }
}
