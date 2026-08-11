import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Stock } from '../../entities/stock.entity';
import { StockMovement } from '../../entities/stock-movement.entity';
import { IStockRepository, InsufficientStockError } from '../stock.repository';

@Injectable()
export class TypeOrmStockRepository implements IStockRepository {
  constructor(
    @InjectRepository(Stock) private readonly repository: Repository<Stock>,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

  async findByProductId(productId: string): Promise<Stock | null> {
    return this.repository.findOne({ where: { productId } });
  }

  async list(): Promise<Stock[]> {
    return this.repository.find();
  }

  async adjust(productId: string, delta: number, orderId?: string): Promise<Stock> {
    return this.dataSource.transaction(async (manager) => {
      const stockRepo = manager.getRepository(Stock);

      let stock = await stockRepo.findOne({
        where: { productId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!stock) {
        stock = stockRepo.create({ productId, quantity: 0 });
      }

      const newQuantity = stock.quantity + delta;
      if (newQuantity < 0) {
        throw new InsufficientStockError(`Stock insuffisant. Stock actuel : ${stock.quantity}`);
      }

      stock.quantity = newQuantity;
      const saved = await stockRepo.save(stock);

      await manager
        .getRepository(StockMovement)
        .save(manager.getRepository(StockMovement).create({ productId, delta, orderId }));

      return saved;
    });
  }

  async initialize(productId: string, quantity: number): Promise<void> {
    const existing = await this.repository.findOne({ where: { productId } });
    if (existing) return;

    await this.repository.save(this.repository.create({ productId, quantity }));
  }
}
