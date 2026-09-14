import { Ticket } from '../entities/ticket.entity';

export abstract class ITicketRepository {
  abstract save(ticket: Ticket): Promise<Ticket>;
  abstract findById(id: string): Promise<Ticket | null>;
  abstract list(): Promise<Ticket[]>;
  abstract delete(id: string): Promise<void>;
  abstract deleteByCustomerId(customerId: string): Promise<number>;
  abstract findByAuthorId(authorId: string): Promise<Ticket[]>;
}
