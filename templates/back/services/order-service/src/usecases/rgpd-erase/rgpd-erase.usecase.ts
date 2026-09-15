import { Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../repositories/order.repository';

export interface RgpdArchiveResult {
  service: string;
  statut: 'archive';
  commandes: number;
}

@Injectable()
export class RgpdEraseUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  // Archivage et non effacement : une facture doit porter nom et adresse pour
  // rester une piece comptable valable (Code de commerce, 10 ans).
  async execute(customerId: string): Promise<RgpdArchiveResult> {
    const commandes = await this.orderRepo.archiveByCustomerId(customerId, new Date());
    return { service: 'order', statut: 'archive', commandes };
  }
}
