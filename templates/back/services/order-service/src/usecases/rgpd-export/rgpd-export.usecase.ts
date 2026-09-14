import { Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../repositories/order.repository';

@Injectable()
export class RgpdExportUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(customerId: string) {
    const orders = await this.orderRepo.findByCustomerIncludingArchived(customerId);
    return {
      commandes: orders.map((order) => ({
        id: order.id,
        date: order.createdAt,
        montantCentimes: order.totalCents,
        lignes: order.items,
        billingAddress: order.billingAddress ?? null,
      })),
    };
  }
}
