import { Test, TestingModule } from '@nestjs/testing';
import { GetCartUseCase } from './get-cart.usecase';
import { ICartRepository } from '../../repositories/cart.repository';
import { Cart } from '../../entities/cart.entity';

describe('GetCartUseCase', () => {
  let usecase: GetCartUseCase;
  let cartRepo: jest.Mocked<ICartRepository>;

  const mockCartRepo = {
    findBySessionKey: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetCartUseCase, { provide: ICartRepository, useValue: mockCartRepo }],
    }).compile();

    usecase = module.get<GetCartUseCase>(GetCartUseCase);
    cartRepo = module.get(ICartRepository);

    jest.clearAllMocks();
  });

  it('devrait renvoyer le panier existant', async () => {
    const cart = new Cart({
      sessionKey: 'sess-1',
      items: [{ productId: 'p1', name: 'A', unitPriceCents: 1000, quantity: 2 }],
      totalCents: 2000,
    });
    cartRepo.findBySessionKey.mockResolvedValue(cart);

    const result = await usecase.execute('sess-1');

    expect(result).toEqual({ message: 'Cart fetched successfully', cart });
  });

  it('devrait renvoyer un panier vide sans rien persister quand il n\'existe pas', async () => {
    cartRepo.findBySessionKey.mockResolvedValue(null);

    const { cart } = await usecase.execute('sess-1');

    expect(cart.sessionKey).toBe('sess-1');
    expect(cart.items).toEqual([]);
    expect(cart.totalCents).toBe(0);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(cartRepo.save).not.toHaveBeenCalled();
  });
});
