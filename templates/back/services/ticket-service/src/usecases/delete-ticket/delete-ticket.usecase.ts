import { Injectable, NotFoundException } from '@nestjs/common';
import { ITicketRepository } from '../../repositories/ticket.repository';

@Injectable()
export class DeleteTicketUseCase {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  async execute(id: string): Promise<void> {
    const ticket = await this.ticketRepo.findById(id);

    if (!ticket) {
      throw new NotFoundException('Ticket introuvable');
    }

    await this.ticketRepo.delete(id);
  }
}
