import { StockMovement } from '../entities/stock-movement.entity';

export abstract class IStockMovementRepository {
  abstract listByProductId(productId: string): Promise<StockMovement[]>;
}
