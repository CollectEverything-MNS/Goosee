import { Injectable } from '@nestjs/common';
import { Cart } from '../../entities/cart.entity';
import { ICartRepository } from '../../repositories/cart.repository';
import { AddItemDto } from './add-item.dto';

@Injectable()
export class AddItemUseCase {
  constructor(private readonly cartRepo: ICartRepository) {}

  async execute(sessionKey: string, dto: AddItemDto) {
    // Get-or-create : le premier ajout crée le panier rattaché au sessionKey.
    const cart =
      (await this.cartRepo.findBySessionKey(sessionKey)) ??
      new Cart({ sessionKey, items: [], totalCents: 0 });

    if (dto.customerId) {
      cart.customerId = dto.customerId;
    }

    const existing = cart.items.find((item) => item.productId === dto.productId);
    if (existing) {
      // Même produit : on incrémente plutôt que de dupliquer la ligne.
      existing.quantity += dto.quantity;
      existing.unitPriceCents = dto.unitPriceCents;
      existing.name = dto.name;
    } else {
      cart.items.push({
        productId: dto.productId,
        name: dto.name,
        unitPriceCents: dto.unitPriceCents,
        quantity: dto.quantity,
      });
    }

    cart.recomputeTotal();
    const saved = await this.cartRepo.save(cart);

    return {
      message: 'Item added to cart successfully',
      cart: saved,
    };
  }
}
