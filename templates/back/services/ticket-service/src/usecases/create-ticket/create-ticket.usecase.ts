import { Injectable } from '@nestjs/common';
import { ITicketRepository } from '../../repositories/ticket.repository';
import { Ticket, TicketStatus } from '../../entities/ticket.entity';
import { CreateTicketDto } from './create-ticket.dto';

@Injectable()
export class CreateTicketUseCase {
  constructor(private readonly ticketRepo: ITicketRepository) {}

  async execute(payload: CreateTicketDto): Promise<Ticket> {
    const ticket = new Ticket();
    ticket.title = payload.title;
    ticket.description = payload.description;
    ticket.authorId = payload.authorId;
    ticket.authorEmail = payload.authorEmail;
    ticket.status = TicketStatus.CREATED;

    return this.ticketRepo.save(ticket);
  }
}
