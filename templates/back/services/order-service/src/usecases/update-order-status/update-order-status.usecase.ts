import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IOrderRepository } from '../../repositories/order.repository';
import { ProductClient } from '../../shared/product-client.service';
import { UpdateOrderStatusDto } from './update-order-status.dto';

@Injectable()
export class UpdateOrderStatusUseCase {
  private readonly logger = new Logger(UpdateOrderStatusUseCase.name);

  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly productClient: ProductClient,
  ) {}

  async execute(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Décrémente le stock une seule fois, à la transition vers « payée ».
    // (Le webhook Stripe peut être rejoué : on ne décrémente pas si déjà payée.)
    const justPaid = dto.status === 'paid' && order.status !== 'paid';

    order.status = dto.status;
    const saved = await this.orderRepo.save(order);

    if (justPaid) {
      await this.decrementStock(saved.items);
    }

    return {
      message: 'Order status updated successfully',
      order: saved,
    };
  }

  private async decrementStock(
    items: { productId: string; quantity: number }[],
  ): Promise<void> {
    for (const item of items) {
      const ok = await this.productClient.adjustStock(item.productId, -item.quantity);
      if (!ok) {
        this.logger.warn(
          `Stock non décrémenté pour le produit ${item.productId} (x${item.quantity}).`,
        );
      }
    }
  }
}
