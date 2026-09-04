import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface RemoteProduct {
  id: string;
  name: string;
  isAvailable: boolean;
}

/**
 * Client HTTP vers le product-service (database-per-service : pas d'accès direct
 * à la table produit). Utilise fetch, comme le webhook paiement -> order-service.
 */
@Injectable()
export class ProductClient {
  private readonly logger = new Logger(ProductClient.name);
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('PRODUCT_SERVICE_HOST', 'localhost');
    const port = this.config.get<string>('PRODUCT_SERVICE_PORT', '3006');
    this.baseUrl = `http://${host}:${port}`;
  }

  async getProduct(id: string): Promise<RemoteProduct | null> {
    try {
      const res = await fetch(`${this.baseUrl}/products/${id}`);
      if (!res.ok) return null;
      const data = (await res.json()) as { product?: RemoteProduct };
      return data.product ?? null;
    } catch (err) {
      this.logger.warn(
        `product-service injoignable (getProduct ${id}) : ${(err as Error).message}`
      );
      return null;
    }
  }
}
