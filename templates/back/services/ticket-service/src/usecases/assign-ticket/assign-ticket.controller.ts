import { Body, Controller, Param, Patch } from '@nestjs/common';
import { AssignTicketUseCase } from './assign-ticket.usecase';
import { AssignTicketDto } from './assign-ticket.dto';

@Controller('tickets')
export class AssignTicketController {
  constructor(private readonly assignTicketUseCase: AssignTicketUseCase) {}

  @Patch(':id/assign')
  async assign(@Param('id') id: string, @Body() dto: AssignTicketDto) {
    return this.assignTicketUseCase.execute(id, dto);
  }
}
