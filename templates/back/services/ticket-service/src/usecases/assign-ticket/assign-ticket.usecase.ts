import { Injectable, NotFoundException } from '@nestjs/common';
import { ITicketRepository } from '../../repositories/ticket.repository';
import { Ticket } from '../../entities/ticket.entity';
import { AssignTicketDto } from './assign-ticket.dto';

@Injectable()
export class AssignTicketUseCase {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  async execute(ticketId: string, payload: AssignTicketDto): Promise<Ticket> {
    const ticket = await this.ticketRepo.findById(ticketId);

    if (!ticket) {
      throw new NotFoundException('Ticket introuvable');
    }

    ticket.assignedTo = payload.assignedTo;

    return this.ticketRepo.save(ticket);
  }
}
