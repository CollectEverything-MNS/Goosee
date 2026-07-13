import { Body, Controller, Param, Patch } from '@nestjs/common';
import { UpdateTicketStatusUseCase } from './update-ticket-status.usecase';
import { UpdateTicketStatusDto } from './update-ticket-status.dto';

@Controller('tickets')
export class UpdateTicketStatusController {
  constructor(
    private readonly updateTicketStatusUseCase: UpdateTicketStatusUseCase
  ) {}

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto
  ) {
    return this.updateTicketStatusUseCase.execute(id, dto);
  }
}
