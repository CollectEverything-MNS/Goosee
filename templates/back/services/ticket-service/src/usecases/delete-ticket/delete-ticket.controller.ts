import { Controller, Delete, Param } from '@nestjs/common';
import { DeleteTicketUseCase } from './delete-ticket.usecase';

@Controller('tickets')
export class DeleteTicketController {
  constructor(private readonly deleteTicketUseCase: DeleteTicketUseCase) {}

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deleteTicketUseCase.execute(id);
    return { message: 'Ticket supprimé' };
  }
}
