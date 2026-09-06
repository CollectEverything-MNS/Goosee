import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { IOrderRepository } from '../../repositories/order.repository';
import { UpdateOrderStatusDto } from './update-order-status.dto';

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    private readonly orderRepo: IOrderRepository,
    @Inject('STOCK_CLIENT') private readonly stockClient: ClientProxy
  ) {}

  async execute(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Le webhook Stripe peut être rejoué : on n'émet l'event qu'à la transition réelle,
    // stock-service est de toute façon idempotent côté consumer.
    const justPaid = dto.status === 'paid' && order.status !== 'paid';
    const justCancelled = dto.status === 'cancelled' && order.status !== 'cancelled';

    order.status = dto.status;
    const saved = await this.orderRepo.save(order);

    if (justPaid) {
      this.stockClient.emit('order.paid', { orderId: saved.id });
    } else if (justCancelled) {
      this.stockClient.emit('order.cancelled', { orderId: saved.id });
    }

    return {
      message: 'Order status updated successfully',
      order: saved,
    };
  }
}
