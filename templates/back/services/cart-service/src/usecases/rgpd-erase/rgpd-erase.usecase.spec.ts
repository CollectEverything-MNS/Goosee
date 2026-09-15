import { Test, TestingModule } from '@nestjs/testing';
import { RgpdEraseUseCase } from './rgpd-erase.usecase';
import { ICartRepository } from '../../repositories/cart.repository';

describe('RgpdEraseUseCase (cart)', () => {
  let usecase: RgpdEraseUseCase;
  const mockCartRepo = {
    findBySessionKey: jest.fn(),
    save: jest.fn(),
    deleteByCustomerId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [RgpdEraseUseCase, { provide: ICartRepository, useValue: mockCartRepo }],
    }).compile();
    usecase = module.get<RgpdEraseUseCase>(RgpdEraseUseCase);
  });

  it('supprime les paniers de l acheteur', async () => {
    mockCartRepo.deleteByCustomerId.mockResolvedValue(2);

    const res = await usecase.execute('c-1');

    expect(mockCartRepo.deleteByCustomerId).toHaveBeenCalledWith('c-1');
    expect(res).toEqual({ service: 'cart', statut: 'efface', paniers: 2 });
  });

  it('renvoie "absent" quand il n y avait aucun panier', async () => {
    mockCartRepo.deleteByCustomerId.mockResolvedValue(0);

    const res = await usecase.execute('c-1');

    expect(res).toEqual({ service: 'cart', statut: 'absent', paniers: 0 });
  });
});
