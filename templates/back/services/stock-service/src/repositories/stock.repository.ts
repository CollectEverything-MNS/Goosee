import { Stock } from '../entities/stock.entity';

export class InsufficientStockError extends Error {}

export abstract class IStockRepository {
  abstract findByProductId(productId: string): Promise<Stock | null>;
  abstract list(): Promise<Stock[]>;
  abstract adjust(productId: string, delta: number, orderId?: string): Promise<Stock>;
}
