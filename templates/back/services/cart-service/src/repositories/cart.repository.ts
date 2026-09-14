import { Cart } from '../entities/cart.entity';

export abstract class ICartRepository {
  abstract findBySessionKey(sessionKey: string): Promise<Cart | null>;
  abstract save(cart: Cart): Promise<Cart>;
  abstract deleteByCustomerId(customerId: string): Promise<number>;
}
