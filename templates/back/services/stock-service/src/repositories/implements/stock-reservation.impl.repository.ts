import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Stock } from '../../entities/stock.entity';
import { StockMovement } from '../../entities/stock-movement.entity';
import { StockReservation } from '../../entities/stock-reservation.entity';
import {
  IStockReservationRepository,
  ReserveItem,
  ReserveResult,
  ReserveShortage,
} from '../stock-reservation.repository';

@Injectable()
export class TypeOrmStockReservationRepository implements IStockReservationRepository {
  constructor(
    @InjectRepository(StockReservation) private readonly repository: Repository<StockReservation>,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

  async reserveAll(
    orderId: string,
    items: ReserveItem[],
    ttlMinutes: number
  ): Promise<ReserveResult> {
    return this.dataSource.transaction(async (manager) => {
      const stockRepo = manager.getRepository(Stock);
      const reservationRepo = manager.getRepository(StockReservation);

      const shortages: ReserveShortage[] = [];
      const toCreate: StockReservation[] = [];
      const sortedItems = [...items].sort((a, b) => a.productId.localeCompare(b.productId));

      for (const item of sortedItems) {
        const stock = await stockRepo.findOne({
          where: { productId: item.productId },
          lock: { mode: 'pessimistic_write' },
        });
        const quantity = stock?.quantity ?? 0;

        const heldRow = await reservationRepo
          .createQueryBuilder('r')
          .select('COALESCE(SUM(r.quantity), 0)', 'sum')
          .where('r.productId = :productId', { productId: item.productId })
          .andWhere('r.status = :status', { status: 'held' })
          .getRawOne<{ sum: string }>();
        const held = Number(heldRow?.sum ?? 0);
        const available = quantity - held;

        if (available < item.quantity) {
          shortages.push({ productId: item.productId, requested: item.quantity, available });
          continue;
        }

        toCreate.push(
          reservationRepo.create({
            productId: item.productId,
            orderId,
            quantity: item.quantity,
            status: 'held',
            expiresAt: new Date(Date.now() + ttlMinutes * 60_000),
          })
        );
      }

      if (shortages.length > 0) {
        return { ok: false, shortages };
      }

      const saved = await reservationRepo.save(toCreate);
      return { ok: true, reservations: saved };
    });
  }

  async confirmByOrderId(orderId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const reservationRepo = manager.getRepository(StockReservation);
      const stockRepo = manager.getRepository(Stock);
      const movementRepo = manager.getRepository(StockMovement);
      const held = await reservationRepo.find({ where: { orderId, status: 'held' } });

      for (const reservation of held) {
        const stock = await stockRepo.findOne({
          where: { productId: reservation.productId },
          lock: { mode: 'pessimistic_write' },
        });
        if (stock) {
          stock.quantity -= reservation.quantity;
          await stockRepo.save(stock);
        }

        reservation.status = 'confirmed';
        await reservationRepo.save(reservation);

        await movementRepo.save(
          movementRepo.create({
            productId: reservation.productId,
            delta: -reservation.quantity,
            orderId,
          })
        );
      }
    });
  }

  async releaseByOrderId(orderId: string): Promise<void> {
    await this.repository.update({ orderId, status: 'held' }, { status: 'released' });
  }

  async releaseExpired(now: Date): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .update(StockReservation)
      .set({ status: 'released' })
      .where('status = :status', { status: 'held' })
      .andWhere('expiresAt < :now', { now })
      .execute();
    return result.affected ?? 0;
  }

  async sumHeldByProductIds(productIds: string[]): Promise<Map<string, number>> {
    if (productIds.length === 0) return new Map();
    const rows = await this.repository
      .createQueryBuilder('r')
      .select('r.productId', 'productId')
      .addSelect('COALESCE(SUM(r.quantity), 0)', 'sum')
      .where('r.productId IN (:...productIds)', { productIds })
      .andWhere('r.status = :status', { status: 'held' })
      .groupBy('r.productId')
      .getRawMany<{ productId: string; sum: string }>();
    return new Map(rows.map((r) => [r.productId, Number(r.sum)]));
  }
}
