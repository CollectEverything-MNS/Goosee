import { Injectable, NotFoundException } from '@nestjs/common';
import { ITicketRepository } from '../../repositories/ticket.repository';
import { Ticket } from '../../entities/ticket.entity';

@Injectable()
export class GetTicketUseCase {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  async execute(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepo.findById(id);

    if (!ticket) {
      throw new NotFoundException('Ticket introuvable');
    }

    return ticket;
  }
}
