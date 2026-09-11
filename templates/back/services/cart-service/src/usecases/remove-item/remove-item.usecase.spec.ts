import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RemoveItemUseCase } from './remove-item.usecase';
import { ICartRepository } from '../../repositories/cart.repository';
import { Cart } from '../../entities/cart.entity';

describe('RemoveItemUseCase', () => {
  let usecase: RemoveItemUseCase;
  let cartRepo: jest.Mocked<ICartRepository>;

  const mockCartRepo = {
    findBySessionKey: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RemoveItemUseCase, { provide: ICartRepository, useValue: mockCartRepo }],
    }).compile();

    usecase = module.get<RemoveItemUseCase>(RemoveItemUseCase);
    cartRepo = module.get(ICartRepository);

    jest.clearAllMocks();
    cartRepo.save.mockImplementation((cart) => Promise.resolve(cart as Cart));
  });

  it('devrait lever une NotFoundException si le panier est absent', async () => {
    cartRepo.findBySessionKey.mockResolvedValue(null);

    await expect(usecase.execute('sess-1', 'p1')).rejects.toThrow(NotFoundException);
  });

  it('devrait retirer la ligne visée, conserver les autres et recalculer le total', async () => {
    cartRepo.findBySessionKey.mockResolvedValue(
      new Cart({
        sessionKey: 'sess-1',
        items: [
          { productId: 'p1', name: 'A', unitPriceCents: 1000, quantity: 2 },
          { productId: 'p2', name: 'B', unitPriceCents: 500, quantity: 3 },
        ],
        totalCents: 3500,
      })
    );

    const { cart } = await usecase.execute('sess-1', 'p1');

    expect(cart.items.map((i) => i.productId)).toEqual(['p2']);
    expect(cart.totalCents).toBe(1500);
  });
});
