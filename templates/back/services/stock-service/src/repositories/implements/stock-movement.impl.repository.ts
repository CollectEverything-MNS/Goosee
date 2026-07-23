import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovement } from '../../entities/stock-movement.entity';
import { IStockMovementRepository } from '../stock-movement.repository';

@Injectable()
export class TypeOrmStockMovementRepository implements IStockMovementRepository {
  constructor(
    @InjectRepository(StockMovement) private readonly repository: Repository<StockMovement>
  ) {}

  async listByProductId(productId: string): Promise<StockMovement[]> {
    return this.repository.find({ where: { productId }, order: { createdAt: 'DESC' } });
  }
}
