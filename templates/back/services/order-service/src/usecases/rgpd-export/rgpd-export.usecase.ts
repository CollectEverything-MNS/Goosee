import { Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../repositories/order.repository';

@Injectable()
export class RgpdExportUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(customerId: string) {
    const orders = await this.orderRepo.findByCustomerIncludingArchived(customerId);
    return {
      // `courriel` et `statut` sont des donnees fournies par la personne ou la
      // concernant directement : l'article 20 les veut dans la restitution.
      commandes: orders.map((order) => ({
        id: order.id,
        date: order.createdAt,
        courriel: order.customerEmail,
        statut: order.status,
        montantCentimes: order.totalCents,
        lignes: order.items,
        billingAddress: order.billingAddress ?? null,
      })),
    };
  }
}
