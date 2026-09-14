import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { IOrderRepository } from '../order.repository';

@Injectable()
export class TypeOrmOrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(Order)
    private readonly repository: Repository<Order>
  ) {}

  async save(order: Order): Promise<Order> {
    return this.repository.save(order);
  }

  async findById(id: string): Promise<Order | null> {
    return this.repository.findOne({ where: { id } });
  }

  async list(): Promise<Order[]> {
    return this.repository.find({
      where: { archivedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async findByCustomer(customerId: string): Promise<Order[]> {
    return this.repository.find({
      where: { customerId, archivedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async archiveByCustomerId(customerId: string, at: Date): Promise<number> {
    const res = await this.repository.update(
      { customerId, archivedAt: IsNull() },
      { archivedAt: at },
    );
    return res.affected ?? 0;
  }

  async listArchived(): Promise<Order[]> {
    return this.repository.find({ where: { archivedAt: Not(IsNull()) } });
  }

  async findByCustomerIncludingArchived(customerId: string): Promise<Order[]> {
    return this.repository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }
}
