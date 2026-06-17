import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../../entities/cart.entity';
import { ICartRepository } from '../cart.repository';

@Injectable()
export class TypeOrmCartRepository implements ICartRepository {
  constructor(
    @InjectRepository(Cart)
    private readonly repository: Repository<Cart>
  ) {}

  async findBySessionKey(sessionKey: string): Promise<Cart | null> {
    return this.repository.findOne({ where: { sessionKey } });
  }

  async save(cart: Cart): Promise<Cart> {
    return this.repository.save(cart);
  }
}
