import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AdjustStockUseCase } from './adjust-stock.usecase';
import { InsufficientStockError, IStockRepository } from '../../repositories/stock.repository';
import { Stock } from '../../entities/stock.entity';

describe('AdjustStockUseCase', () => {
  let usecase: AdjustStockUseCase;
  let stockRepo: jest.Mocked<IStockRepository>;

  const mockStockRepo = {
    findByProductId: jest.fn(),
    list: jest.fn(),
    adjust: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdjustStockUseCase, { provide: IStockRepository, useValue: mockStockRepo }],
    }).compile();

    usecase = module.get<AdjustStockUseCase>(AdjustStockUseCase);
    stockRepo = module.get(IStockRepository);

    jest.clearAllMocks();
  });

  it('devrait appliquer un delta positif (réassort)', async () => {
    const stock = { productId: 'product-1', quantity: 50 } as Stock;
    stockRepo.adjust.mockResolvedValue(stock);

    const result = await usecase.execute('product-1', { quantity: 10 });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(stockRepo.adjust).toHaveBeenCalledWith('product-1', 10);
    expect(result).toEqual({ message: 'Stock updated successfully', stock });
  });

  it('devrait appliquer un delta négatif (correction manuelle)', async () => {
    const stock = { productId: 'product-1', quantity: 40 } as Stock;
    stockRepo.adjust.mockResolvedValue(stock);

    await usecase.execute('product-1', { quantity: -10 });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(stockRepo.adjust).toHaveBeenCalledWith('product-1', -10);
  });

  it('devrait convertir InsufficientStockError en BadRequestException', async () => {
    stockRepo.adjust.mockRejectedValue(new InsufficientStockError('Stock insuffisant. Stock actuel : 5'));

    await expect(usecase.execute('product-1', { quantity: -10 })).rejects.toThrow(BadRequestException);
    await expect(usecase.execute('product-1', { quantity: -10 })).rejects.toThrow(
      'Stock insuffisant. Stock actuel : 5'
    );
  });

  it('devrait renvoyer une BadRequestException si le repo refuse à cause des réservations en cours', async () => {
    stockRepo.adjust.mockRejectedValue(
      new InsufficientStockError(
        'Stock insuffisant : 8 unité(s) déjà réservée(s) pour des commandes en cours (stock actuel 10).'
      )
    );

    await expect(usecase.execute('product-1', { quantity: -5 })).rejects.toThrow(BadRequestException);
    await expect(usecase.execute('product-1', { quantity: -5 })).rejects.toThrow(
      'déjà réservée(s) pour des commandes en cours'
    );
  });

  it('devrait laisser remonter une erreur inattendue telle quelle', async () => {
    stockRepo.adjust.mockRejectedValue(new Error('DB down'));

    await expect(usecase.execute('product-1', { quantity: -10 })).rejects.toThrow('DB down');
  });
});
