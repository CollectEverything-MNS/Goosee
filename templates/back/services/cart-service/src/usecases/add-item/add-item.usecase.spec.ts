import { Test, TestingModule } from '@nestjs/testing';
import { AddItemUseCase } from './add-item.usecase';
import { ICartRepository } from '../../repositories/cart.repository';
import { Cart } from '../../entities/cart.entity';
import { AddItemDto } from './add-item.dto';

describe('AddItemUseCase', () => {
  let usecase: AddItemUseCase;
  let cartRepo: jest.Mocked<ICartRepository>;

  const mockCartRepo = {
    findBySessionKey: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AddItemUseCase, { provide: ICartRepository, useValue: mockCartRepo }],
    }).compile();

    usecase = module.get<AddItemUseCase>(AddItemUseCase);
    cartRepo = module.get(ICartRepository);

    jest.clearAllMocks();
    cartRepo.save.mockImplementation((cart) => Promise.resolve(cart as Cart));
  });

  const dto: AddItemDto = {
    productId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'T-shirt',
    unitPriceCents: 1500,
    quantity: 2,
  };

  it('devrait créer le panier au premier ajout et calculer le total', async () => {
    cartRepo.findBySessionKey.mockResolvedValue(null);

    const { cart } = await usecase.execute('sess-1', dto);

    expect(cart.sessionKey).toBe('sess-1');
    expect(cart.items).toEqual([
      { productId: dto.productId, name: 'T-shirt', unitPriceCents: 1500, quantity: 2 },
    ]);
    expect(cart.totalCents).toBe(3000);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(cartRepo.save).toHaveBeenCalledWith(cart);
  });

  it('devrait incrémenter la quantité et rafraîchir prix/nom si le produit est déjà présent', async () => {
    const existing = new Cart({
      sessionKey: 'sess-1',
      items: [{ productId: dto.productId, name: 'Ancien nom', unitPriceCents: 1000, quantity: 1 }],
      totalCents: 1000,
    });
    cartRepo.findBySessionKey.mockResolvedValue(existing);

    const { cart } = await usecase.execute('sess-1', dto);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).toEqual({
      productId: dto.productId,
      name: 'T-shirt',
      unitPriceCents: 1500,
      quantity: 3,
    });
    expect(cart.totalCents).toBe(4500);
  });

  it('devrait rattacher le customerId au panier quand il est fourni', async () => {
    cartRepo.findBySessionKey.mockResolvedValue(null);

    const { cart } = await usecase.execute('sess-1', {
      ...dto,
      customerId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    });

    expect(cart.customerId).toBe('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
  });
});
