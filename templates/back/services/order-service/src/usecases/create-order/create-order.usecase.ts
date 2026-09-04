import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Order } from '../../entities/order.entity';
import { IOrderRepository } from '../../repositories/order.repository';
import { ProductClient } from '../../shared/product-client.service';
import { StockClient } from '../../shared/stock-client.service';
import { CreateOrderDto } from './create-order.dto';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly productClient: ProductClient,
    private readonly stockClient: StockClient
  ) {}

  async execute(dto: CreateOrderDto) {
    const productNames = await this.assertProductsAvailable(dto.items);

    // Le total est recalculé côté serveur : le front ne fait pas autorité sur le prix.
    const totalCents = dto.items.reduce(
      (sum, item) => sum + item.unitPriceCents * item.quantity,
      0
    );

    // Id pré-généré : permet de réserver le stock avec cet id avant même que la commande n'existe en base
    const orderId = uuidv4();

    const reservation = await this.stockClient.reserve(
      orderId,
      dto.items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
    );

    if (!reservation.ok) {
      const [shortage] = reservation.shortages;
      const name = productNames.get(shortage.productId) ?? shortage.productId;
      throw new BadRequestException(
        `Stock insuffisant pour "${name}" (reste ${shortage.available}).`
      );
    }

    const order = new Order({
      id: orderId,
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

  private async assertProductsAvailable(
    items: CreateOrderDto['items']
  ): Promise<Map<string, string>> {
    const names = new Map<string, string>();

    for (const item of items) {
      const product = await this.productClient.getProduct(item.productId);
      if (!product) continue;

      names.set(item.productId, product.name);

      if (!product.isAvailable) {
        throw new BadRequestException(`"${product.name}" n'est plus disponible.`);
      }
    }

    return names;
  }
}
