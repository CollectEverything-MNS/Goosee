import { Injectable } from '@nestjs/common';
import { Cart } from '../../entities/cart.entity';
import { ICartRepository } from '../../repositories/cart.repository';

@Injectable()
export class ClearCartUseCase {
  constructor(private readonly cartRepo: ICartRepository) {}

  async execute(sessionKey: string) {
    const cart = await this.cartRepo.findBySessionKey(sessionKey);

    // Idempotent : vider un panier inexistant renvoie simplement un panier vide.
    if (!cart) {
      return {
        message: 'Cart cleared successfully',
        cart: new Cart({ sessionKey, items: [], totalCents: 0 }),
      };
    }

    cart.items = [];
    cart.recomputeTotal();
    const saved = await this.cartRepo.save(cart);

    return {
      message: 'Cart cleared successfully',
      cart: saved,
    };
  }
}
