import { Injectable, NotFoundException } from '@nestjs/common';
import { ITicketRepository } from '../../repositories/ticket.repository';
import { Ticket } from '../../entities/ticket.entity';
import { UpdateTicketStatusDto } from './update-ticket-status.dto';

@Injectable()
export class UpdateTicketStatusUseCase {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  async execute(
    ticketId: string,
    payload: UpdateTicketStatusDto
  ): Promise<Ticket> {
    const ticket = await this.ticketRepo.findById(ticketId);

    if (!ticket) {
      throw new NotFoundException('Ticket introuvable');
    }

    ticket.status = payload.status;

    return this.ticketRepo.save(ticket);
  }
}
