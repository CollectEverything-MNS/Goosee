import { Injectable } from '@nestjs/common';
import { IStockRepository } from '../../repositories/stock.repository';
import { IStockReservationRepository } from '../../repositories/stock-reservation.repository';

@Injectable()
export class GetStockUseCase {
  constructor(
    private readonly stockRepo: IStockRepository,
    private readonly reservationRepo: IStockReservationRepository
  ) {}

  async execute(productId: string) {
    const stock = await this.stockRepo.findByProductId(productId);
    const quantity = stock?.quantity ?? 0;
    const heldMap = await this.reservationRepo.sumHeldByProductIds([productId]);
    const held = heldMap.get(productId) ?? 0;

    return {
      stock: {
        productId,
        quantity,
        available: quantity - held,
      },
    };
  }
}
