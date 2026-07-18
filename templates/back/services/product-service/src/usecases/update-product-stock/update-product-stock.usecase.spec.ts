import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateProductStockUseCase } from './update-product-stock.usecase';
import { IProductRepository } from '../../repositories/product.repository';
import { UpdateProductStockDto } from './update-product-stock.dto';
import { LogClient } from '../../services/log-client.service';
import { Product } from '../../entities/product.entity';

describe('UpdateProductStockUseCase', () => {
  let usecase: UpdateProductStockUseCase;
  let productRepo: jest.Mocked<IProductRepository>;
  let logClient: jest.Mocked<LogClient>;

  const mockProductRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    listByCategoryId: jest.fn(),
    countByCategoryId: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockLogClient = {
    info: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    critical: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProductStockUseCase,
        { provide: IProductRepository, useValue: mockProductRepo },
        { provide: LogClient, useValue: mockLogClient },
      ],
    }).compile();

    usecase = module.get<UpdateProductStockUseCase>(UpdateProductStockUseCase);
    productRepo = module.get(IProductRepository);
    logClient = module.get(LogClient);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const existingProduct = {
      id: 'product-1',
      name: 'Pizza',
      description: 'Pizza margherita',
      price: 10,
      stock: 5,
      preparationTime: 0,
      sizeValue: null,
      sizeUnit: null,
      isAvailable: true,
      categoryId: 'category-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      deletedAt: null,
    } as unknown as Product;

    it('devrait lever NotFoundException si le produit n\'existe pas', async () => {
      productRepo.findById.mockResolvedValue(null);

      const dto: UpdateProductStockDto = { quantity: 1 };

      await expect(usecase.execute('missing-id', dto)).rejects.toThrow(NotFoundException);
      await expect(usecase.execute('missing-id', dto)).rejects.toThrow('Product not found');
      expect(productRepo.save).not.toHaveBeenCalled();
    });

    it('devrait incrémenter le stock avec une quantité positive', async () => {
      const dto: UpdateProductStockDto = { quantity: 3 };
      productRepo.findById.mockResolvedValue({ ...existingProduct });
      productRepo.save.mockImplementation(async (p) => p as Product);

      const result = await usecase.execute('product-1', dto);

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ stock: 8, isAvailable: true }),
      );
      expect(logClient.warning).not.toHaveBeenCalled();
      expect(logClient.success).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Stock updated successfully',
        product: {
          id: 'product-1',
          name: 'Pizza',
          stock: 8,
          isAvailable: true,
        },
      });
    });

    it('devrait décrémenter le stock sans désactiver le produit si le stock reste positif', async () => {
      const dto: UpdateProductStockDto = { quantity: -2 };
      productRepo.findById.mockResolvedValue({ ...existingProduct });
      productRepo.save.mockImplementation(async (p) => p as Product);

      const result = await usecase.execute('product-1', dto);

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ stock: 3, isAvailable: true }),
      );
      expect(logClient.warning).not.toHaveBeenCalled();
      expect(result.product.isAvailable).toBe(true);
    });

    it('devrait lever BadRequestException si le nouveau stock est négatif', async () => {
      const dto: UpdateProductStockDto = { quantity: -10 };
      productRepo.findById.mockResolvedValue({ ...existingProduct });

      await expect(usecase.execute('product-1', dto)).rejects.toThrow(BadRequestException);
      await expect(usecase.execute('product-1', dto)).rejects.toThrow(
        'Stock insuffisant. Stock actuel : 5',
      );
      expect(logClient.warning).toHaveBeenCalled();
      expect(productRepo.save).not.toHaveBeenCalled();
    });

    it('devrait désactiver le produit quand le stock atteint exactement 0', async () => {
      const dto: UpdateProductStockDto = { quantity: -5 };
      productRepo.findById.mockResolvedValue({ ...existingProduct });
      productRepo.save.mockImplementation(async (p) => p as Product);

      const result = await usecase.execute('product-1', dto);

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ stock: 0, isAvailable: false }),
      );
      expect(logClient.warning).toHaveBeenCalledTimes(1);
      expect(logClient.success).toHaveBeenCalled();
      expect(result.product.isAvailable).toBe(false);
    });

    it('ne retourne que les champs restreints (id, name, stock, isAvailable)', async () => {
      const dto: UpdateProductStockDto = { quantity: 1 };
      productRepo.findById.mockResolvedValue({ ...existingProduct });
      productRepo.save.mockImplementation(async (p) => ({
        ...(p as Product),
        price: 999,
        categoryId: 'should-not-leak',
      }));

      const result = await usecase.execute('product-1', dto);

      expect(result).toEqual({
        message: 'Stock updated successfully',
        product: {
          id: 'product-1',
          name: 'Pizza',
          stock: 6,
          isAvailable: true,
        },
      });
    });
  });
});
