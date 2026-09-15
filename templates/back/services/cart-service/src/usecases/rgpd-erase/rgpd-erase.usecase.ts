import { Injectable } from '@nestjs/common';
import { ICartRepository } from '../../repositories/cart.repository';

export interface RgpdEraseResult {
  service: string;
  statut: 'efface' | 'absent';
  paniers: number;
}

@Injectable()
export class RgpdEraseUseCase {
  constructor(private readonly cartRepo: ICartRepository) {}

  async execute(customerId: string): Promise<RgpdEraseResult> {
    const paniers = await this.cartRepo.deleteByCustomerId(customerId);
    return { service: 'cart', statut: paniers > 0 ? 'efface' : 'absent', paniers };
  }
}
