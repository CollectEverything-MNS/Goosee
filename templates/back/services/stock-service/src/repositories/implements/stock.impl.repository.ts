import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Stock } from '../../entities/stock.entity';
import { StockMovement } from '../../entities/stock-movement.entity';
import { StockReservation } from '../../entities/stock-reservation.entity';
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

      // Sur une baisse manuelle, on ne peut pas descendre sous ce qui est déjà
      // réservé (statut `held`) pour des commandes pas encore confirmées : sinon
      // `confirmByOrderId` ferait passer la quantité en négatif (survente).
      // Le lock `pessimistic_write` ci-dessus sérialise cette lecture avec `reserveAll`.
      if (delta < 0) {
        const heldRow = await manager
          .getRepository(StockReservation)
          .createQueryBuilder('r')
          .select('COALESCE(SUM(r.quantity), 0)', 'sum')
          .where('r.productId = :productId', { productId })
          .andWhere('r.status = :status', { status: 'held' })
          .getRawOne<{ sum: string }>();
        const held = Number(heldRow?.sum ?? 0);

        if (newQuantity < held) {
          throw new InsufficientStockError(
            `Stock insuffisant : ${held} unité(s) déjà réservée(s) pour des commandes en cours ` +
              `(stock actuel ${stock.quantity}).`
          );
        }
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
