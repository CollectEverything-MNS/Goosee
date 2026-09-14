import { Injectable } from '@nestjs/common';
import { ITicketRepository } from '../../repositories/ticket.repository';

@Injectable()
export class RgpdExportUseCase {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  async execute(customerId: string) {
    const tickets = await this.ticketRepo.findByAuthorId(customerId);
    return {
      tickets: tickets.map((ticket) => ({
        sujet: ticket.title,
        date: ticket.createdAt,
        statut: ticket.status,
      })),
    };
  }
}
