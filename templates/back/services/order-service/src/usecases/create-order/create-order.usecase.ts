import { BadRequestException, Injectable } from '@nestjs/common';
import { Order } from '../../entities/order.entity';
import { IOrderRepository } from '../../repositories/order.repository';
import { ProductClient } from '../../shared/product-client.service';
import { CreateOrderDto } from './create-order.dto';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly productClient: ProductClient,
  ) {}

  async execute(dto: CreateOrderDto) {
    // Vérifie la disponibilité du stock avant de créer la commande.
    await this.assertStockAvailable(dto.items);

    // Le total est recalculé côté serveur : le front ne fait pas autorité sur le prix.
    const totalCents = dto.items.reduce(
      (sum, item) => sum + item.unitPriceCents * item.quantity,
      0
    );

    const order = new Order({
      customerId: dto.customerId,
      customerEmail: dto.customerEmail,
      items: dto.items,
      totalCents,
      billingAddress: dto.billingAddress,
      status: 'pending',
    });

    const saved = await this.orderRepo.save(order);

    return {
      message: 'Order created successfully',
      order: saved,
    };
  }

  // Refuse la commande si un produit est indisponible ou en stock insuffisant.
  // Si le product-service est injoignable, on laisse passer (le décrément au paiement refera foi).
  private async assertStockAvailable(items: CreateOrderDto['items']): Promise<void> {
    for (const item of items) {
      const product = await this.productClient.getProduct(item.productId);
      if (!product) continue;
      if (!product.isAvailable || product.stock <= 0) {
        throw new BadRequestException(`"${product.name}" n'est plus disponible.`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour "${product.name}" (reste ${product.stock}).`,
        );
      }
    }
  }
}
