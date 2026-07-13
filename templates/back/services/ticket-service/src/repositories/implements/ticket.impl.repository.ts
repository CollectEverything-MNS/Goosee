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
}
