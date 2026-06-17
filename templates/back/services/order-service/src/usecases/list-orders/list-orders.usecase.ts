import { Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../repositories/order.repository';

@Injectable()
export class ListOrdersUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(customerId?: string) {
    // Si un client est précisé, on ne renvoie que ses commandes.
    const orders = customerId
      ? await this.orderRepo.findByCustomer(customerId)
      : await this.orderRepo.list();

    return {
      message: 'Orders fetched successfully',
      orders,
    };
  }
}
