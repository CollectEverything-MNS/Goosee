import { Test, TestingModule } from '@nestjs/testing';
import { ClearCartUseCase } from './clear-cart.usecase';
import { ICartRepository } from '../../repositories/cart.repository';
import { Cart } from '../../entities/cart.entity';

describe('ClearCartUseCase', () => {
  let usecase: ClearCartUseCase;
  let cartRepo: jest.Mocked<ICartRepository>;

  const mockCartRepo = {
    findBySessionKey: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClearCartUseCase, { provide: ICartRepository, useValue: mockCartRepo }],
    }).compile();

    usecase = module.get<ClearCartUseCase>(ClearCartUseCase);
    cartRepo = module.get(ICartRepository);

    jest.clearAllMocks();
    cartRepo.save.mockImplementation((cart) => Promise.resolve(cart as Cart));
  });

  it('devrait être idempotent : vider un panier inexistant renvoie un panier vide sans persistance', async () => {
    cartRepo.findBySessionKey.mockResolvedValue(null);

    const { cart } = await usecase.execute('sess-1');

    expect(cart.items).toEqual([]);
    expect(cart.totalCents).toBe(0);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(cartRepo.save).not.toHaveBeenCalled();
  });

  it('devrait vider les lignes d\'un panier existant et le sauvegarder', async () => {
    cartRepo.findBySessionKey.mockResolvedValue(
      new Cart({
        sessionKey: 'sess-1',
        items: [{ productId: 'p1', name: 'A', unitPriceCents: 1000, quantity: 2 }],
        totalCents: 2000,
      })
    );

    const { cart } = await usecase.execute('sess-1');

    expect(cart.items).toEqual([]);
    expect(cart.totalCents).toBe(0);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(cartRepo.save).toHaveBeenCalledWith(cart);
  });
});
