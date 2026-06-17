import { Injectable, NotFoundException } from '@nestjs/common';
import { ICartRepository } from '../../repositories/cart.repository';

@Injectable()
export class RemoveItemUseCase {
  constructor(private readonly cartRepo: ICartRepository) {}

  async execute(sessionKey: string, productId: string) {
    const cart = await this.cartRepo.findBySessionKey(sessionKey);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = cart.items.filter((i) => i.productId !== productId);
    cart.recomputeTotal();
    const saved = await this.cartRepo.save(cart);

    return {
      message: 'Cart item removed successfully',
      cart: saved,
    };
  }
}
