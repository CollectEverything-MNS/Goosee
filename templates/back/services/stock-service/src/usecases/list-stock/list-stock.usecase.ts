import { Injectable } from '@nestjs/common';
import { IStockRepository } from '../../repositories/stock.repository';
import { IStockReservationRepository } from '../../repositories/stock-reservation.repository';

@Injectable()
export class ListStockUseCase {
  constructor(
    private readonly stockRepo: IStockRepository,
    private readonly reservationRepo: IStockReservationRepository
  ) {}

  async execute() {
    const stocks = await this.stockRepo.list();
    const productIds = stocks.map((s) => s.productId);
    const heldMap = await this.reservationRepo.sumHeldByProductIds(productIds);

    return {
      stocks: stocks.map((stock) => ({
        productId: stock.productId,
        quantity: stock.quantity,
        available: stock.quantity - (heldMap.get(stock.productId) ?? 0),
      })),
    };
  }
}
