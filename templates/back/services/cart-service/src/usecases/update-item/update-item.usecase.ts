import { Injectable, NotFoundException } from '@nestjs/common';
import { ICartRepository } from '../../repositories/cart.repository';
import { UpdateItemDto } from './update-item.dto';

@Injectable()
export class UpdateItemUseCase {
  constructor(private readonly cartRepo: ICartRepository) {}

  async execute(sessionKey: string, productId: string, dto: UpdateItemDto) {
    const cart = await this.cartRepo.findBySessionKey(sessionKey);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = cart.items.find((i) => i.productId === productId);
    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    if (dto.quantity === 0) {
      cart.items = cart.items.filter((i) => i.productId !== productId);
    } else {
      item.quantity = dto.quantity;
    }

    cart.recomputeTotal();
    const saved = await this.cartRepo.save(cart);

    return {
      message: 'Cart item updated successfully',
      cart: saved,
    };
  }
}
