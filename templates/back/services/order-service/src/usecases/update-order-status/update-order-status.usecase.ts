import { Injectable, NotFoundException } from '@nestjs/common';
import { IOrderRepository } from '../../repositories/order.repository';
import { UpdateOrderStatusDto } from './update-order-status.dto';

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = dto.status;
    const saved = await this.orderRepo.save(order);

    return {
      message: 'Order status updated successfully',
      order: saved,
    };
  }
}
