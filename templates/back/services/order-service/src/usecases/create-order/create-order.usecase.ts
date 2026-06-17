import { Injectable } from '@nestjs/common';
import { Order } from '../../entities/order.entity';
import { IOrderRepository } from '../../repositories/order.repository';
import { CreateOrderDto } from './create-order.dto';

@Injectable()
export class CreateOrderUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(dto: CreateOrderDto) {
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
      status: 'pending',
    });

    const saved = await this.orderRepo.save(order);

    return {
      message: 'Order created successfully',
      order: saved,
    };
  }
}
