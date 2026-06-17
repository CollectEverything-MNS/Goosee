import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../entities/payment.entity';
import { IPaymentRepository } from '../payment.repository';

@Injectable()
export class TypeOrmPaymentRepository implements IPaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly repository: Repository<Payment>
  ) {}

  async save(payment: Payment): Promise<Payment> {
    return this.repository.save(payment);
  }

  async findById(id: string): Promise<Payment | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByProviderRef(providerRef: string): Promise<Payment | null> {
    return this.repository.findOne({ where: { providerRef } });
  }
}
