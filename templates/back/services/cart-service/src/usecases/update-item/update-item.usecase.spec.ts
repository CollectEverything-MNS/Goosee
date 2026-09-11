import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateItemUseCase } from './update-item.usecase';
import { ICartRepository } from '../../repositories/cart.repository';
import { Cart } from '../../entities/cart.entity';

describe('UpdateItemUseCase', () => {
  let usecase: UpdateItemUseCase;
  let cartRepo: jest.Mocked<ICartRepository>;

  const mockCartRepo = {
    findBySessionKey: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UpdateItemUseCase, { provide: ICartRepository, useValue: mockCartRepo }],
    }).compile();

    usecase = module.get<UpdateItemUseCase>(UpdateItemUseCase);
    cartRepo = module.get(ICartRepository);

    jest.clearAllMocks();
    cartRepo.save.mockImplementation((cart) => Promise.resolve(cart as Cart));
  });

  const cartWith = () =>
    new Cart({
      sessionKey: 'sess-1',
      items: [
        { productId: 'p1', name: 'A', unitPriceCents: 1000, quantity: 2 },
        { productId: 'p2', name: 'B', unitPriceCents: 500, quantity: 1 },
      ],
      totalCents: 2500,
    });

  it('devrait lever une NotFoundException si le panier est absent', async () => {
    cartRepo.findBySessionKey.mockResolvedValue(null);

    await expect(usecase.execute('sess-1', 'p1', { quantity: 3 })).rejects.toThrow(NotFoundException);
  });

  it("devrait lever une NotFoundException si la ligne n'est pas dans le panier", async () => {
    cartRepo.findBySessionKey.mockResolvedValue(cartWith());

    await expect(usecase.execute('sess-1', 'inconnu', { quantity: 3 })).rejects.toThrow(
      NotFoundException
    );
  });

  it('devrait fixer la quantité absolue et recalculer le total', async () => {
    cartRepo.findBySessionKey.mockResolvedValue(cartWith());

    const { cart } = await usecase.execute('sess-1', 'p1', { quantity: 5 });

    expect(cart.items.find((i) => i.productId === 'p1')?.quantity).toBe(5);
    expect(cart.totalCents).toBe(5000 + 500);
  });

  it('devrait retirer la ligne quand la quantité vaut 0', async () => {
    cartRepo.findBySessionKey.mockResolvedValue(cartWith());

    const { cart } = await usecase.execute('sess-1', 'p1', { quantity: 0 });

    expect(cart.items.map((i) => i.productId)).toEqual(['p2']);
    expect(cart.totalCents).toBe(500);
  });
});
