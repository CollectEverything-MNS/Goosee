import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../../entities/ticket.entity';
import { ITicketRepository } from '../ticket.repository';

@Injectable()
export class TypeOrmTicketRepository implements ITicketRepository {
  constructor(
    @InjectRepository(Ticket)
    private readonly repository: Repository<Ticket>
  ) {}

  async save(ticket: Ticket): Promise<Ticket> {
    return this.repository.save(ticket);
  }

  async findById(id: string): Promise<Ticket | null> {
    return this.repository.findOne({ where: { id } });
  }

  async list(): Promise<Ticket[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  // Le ticket n'a pas de colonne "customerId" : le rattachement a l'acheteur
  // se fait via authorId, l'identifiant de la personne qui a cree le ticket.
  async deleteByCustomerId(customerId: string): Promise<number> {
    const res = await this.repository.delete({ authorId: customerId });
    return res.affected ?? 0;
  }

  async findByAuthorId(authorId: string): Promise<Ticket[]> {
    return this.repository.find({
      where: { authorId },
      order: { createdAt: 'DESC' },
    });
  }
}
