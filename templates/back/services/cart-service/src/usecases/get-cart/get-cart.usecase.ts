import { Injectable } from '@nestjs/common';
import { Cart } from '../../entities/cart.entity';
import { ICartRepository } from '../../repositories/cart.repository';

@Injectable()
export class GetCartUseCase {
  constructor(private readonly cartRepo: ICartRepository) {}

  async execute(sessionKey: string) {
    // Pas de persistance sur lecture : un panier inexistant renvoie un panier vide.
    const cart =
      (await this.cartRepo.findBySessionKey(sessionKey)) ??
      new Cart({ sessionKey, items: [], totalCents: 0 });

    return {
      message: 'Cart fetched successfully',
      cart,
    };
  }
}
