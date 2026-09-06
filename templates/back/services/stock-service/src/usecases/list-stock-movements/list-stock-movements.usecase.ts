import { Injectable } from '@nestjs/common';
import { IStockMovementRepository } from '../../repositories/stock-movement.repository';

@Injectable()
export class ListStockMovementsUseCase {
  constructor(private readonly movementRepo: IStockMovementRepository) {}

  async execute(productId: string) {
    const movements = await this.movementRepo.listByProductId(productId);
    return { movements };
  }
}
