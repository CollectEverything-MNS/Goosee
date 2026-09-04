import { BadRequestException, Injectable } from '@nestjs/common';
import { InsufficientStockError, IStockRepository } from '../../repositories/stock.repository';
import { AdjustStockDto } from './adjust-stock.dto';

@Injectable()
export class AdjustStockUseCase {
  constructor(private readonly stockRepo: IStockRepository) {}

  async execute(productId: string, dto: AdjustStockDto) {
    try {
      const stock = await this.stockRepo.adjust(productId, dto.quantity);
      return {
        message: 'Stock updated successfully',
        stock,
      };
    } catch (err) {
      if (err instanceof InsufficientStockError) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }
}
