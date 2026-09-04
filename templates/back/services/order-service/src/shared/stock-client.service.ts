import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ReserveStockItem {
  productId: string;
  quantity: number;
}

export interface StockShortage {
  productId: string;
  requested: number;
  available: number;
}

export type ReserveOutcome = { ok: true } | { ok: false; shortages: StockShortage[] };

@Injectable()
export class StockClient {
  private readonly logger = new Logger(StockClient.name);
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('STOCK_SERVICE_HOST', 'localhost');
    const port = this.config.get<string>('STOCK_SERVICE_PORT', '3011');
    this.baseUrl = `http://${host}:${port}`;
  }

  async reserve(orderId: string, items: ReserveStockItem[]): Promise<ReserveOutcome> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/stock/reserve`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderId, items }),
      });
    } catch (err) {
      this.logger.warn(
        `stock-service injoignable (reserve ${orderId}) : ${(err as Error).message}`
      );
      throw new BadRequestException('Réservation de stock impossible pour le moment');
    }

    if (res.ok) {
      return { ok: true };
    }

    if (res.status === 400) {
      const body = (await res.json()) as { shortages?: StockShortage[] };
      return { ok: false, shortages: body.shortages ?? [] };
    }

    this.logger.warn(`stock-service a répondu ${res.status} pour la réservation ${orderId}`);
    throw new BadRequestException('Réservation de stock impossible pour le moment');
  }
}
