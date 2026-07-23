import { StockReservation } from '../entities/stock-reservation.entity';

export interface ReserveItem {
  productId: string;
  quantity: number;
}

export interface ReserveShortage {
  productId: string;
  requested: number;
  available: number;
}

export type ReserveResult =
  | { ok: true; reservations: StockReservation[] }
  | { ok: false; shortages: ReserveShortage[] };

export abstract class IStockReservationRepository {
  abstract reserveAll(
    orderId: string,
    items: ReserveItem[],
    ttlMinutes: number
  ): Promise<ReserveResult>;
  abstract confirmByOrderId(orderId: string): Promise<void>;
  abstract releaseByOrderId(orderId: string): Promise<void>;
  abstract releaseExpired(now: Date): Promise<number>;
  abstract sumHeldByProductIds(productIds: string[]): Promise<Map<string, number>>;
}
