import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class StockClient {
  private readonly logger = new Logger(StockClient.name);

  constructor(@Inject('STOCK_CLIENT') private readonly client: ClientProxy) {}

  productCreated(productId: string, initialStock?: number) {
    try {
      this.client.emit('product.created', { productId, initialStock: initialStock ?? 0 });
    } catch (err) {
      this.logger.error(`Échec de l'émission de product.created : ${(err as Error).message}`);
    }
  }
}
