import { Injectable, NotFoundException } from '@nestjs/common';
import { IOrderRepository } from '../../repositories/order.repository';

@Injectable()
export class GetOrderUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(id: string) {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      message: 'Order fetched successfully',
      order,
    };
  }
}
