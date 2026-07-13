import { Injectable } from '@nestjs/common';
import { ITicketRepository } from '../../repositories/ticket.repository';
import { Ticket } from '../../entities/ticket.entity';

@Injectable()
export class ListTicketsUseCase {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  async execute(): Promise<Ticket[]> {
    return this.ticketRepo.list();
  }
}
