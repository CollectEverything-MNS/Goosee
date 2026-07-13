import { Body, Controller, Param, Patch } from '@nestjs/common';
import { CloseTicketUseCase } from './close-ticket.usecase';
import { CloseTicketDto } from './close-ticket.dto';

@Controller('tickets')
export class CloseTicketController {
  constructor(private readonly closeTicketUseCase: CloseTicketUseCase) {}

  @Patch(':id/close')
  async close(@Param('id') id: string, @Body() dto: CloseTicketDto) {
    return this.closeTicketUseCase.execute(id, dto);
  }
}
