import { Injectable } from '@nestjs/common';
import { IStockRepository } from '../../repositories/stock.repository';

@Injectable()
export class CreateStockUseCase {
  constructor(private readonly stockRepo: IStockRepository) {}

  async execute(productId: string, initialStock: number): Promise<void> {
    await this.stockRepo.initialize(productId, Math.max(0, initialStock));
  }
}
