import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CreateProductUseCase } from './create-product.usecase';
import { IProductRepository } from '../../repositories/product.repository';
import { ICategoryRepository } from '../../repositories/category.repository';
import { CreateProductDto } from './create-product.dto';
import { LogClient } from '../../services/log-client.service';
import { Category } from '../../entities/category.entity';
import { Product } from '../../entities/product.entity';

describe('CreateProductUseCase', () => {
  let usecase: CreateProductUseCase;
  let productRepo: jest.Mocked<IProductRepository>;
  let categoryRepo: jest.Mocked<ICategoryRepository>;
  let logClient: jest.Mocked<LogClient>;

  const mockProductRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    listByCategoryId: jest.fn(),
    countByCategoryId: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockCategoryRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    listByParentId: jest.fn(),
    hasProducts: jest.fn(),
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
        CreateProductUseCase,
        { provide: IProductRepository, useValue: mockProductRepo },
        { provide: ICategoryRepository, useValue: mockCategoryRepo },
        { provide: LogClient, useValue: mockLogClient },
      ],
    }).compile();

    usecase = module.get<CreateProductUseCase>(CreateProductUseCase);
    productRepo = module.get(IProductRepository);
    categoryRepo = module.get(ICategoryRepository);
    logClient = module.get(LogClient);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const existingCategory = { id: 'category-1', name: 'Vins' } as Category;

    const baseDto: CreateProductDto = {
      name: 'Château Margaux 2019',
      description: 'Grand vin de Bordeaux',
      price: 1299,
      stock: 5,
      categoryId: 'category-1',
    };

    it('devrait lever NotFoundException si la catégorie n\'existe pas', async () => {
      categoryRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute(baseDto)).rejects.toThrow(NotFoundException);
      await expect(usecase.execute(baseDto)).rejects.toThrow(
        `Category not found : ${baseDto.categoryId}`,
      );
      expect(logClient.warning).toHaveBeenCalled();
      expect(productRepo.save).not.toHaveBeenCalled();
    });

    it('devrait créer un produit disponible par défaut', async () => {
      categoryRepo.findById.mockResolvedValue(existingCategory);
      productRepo.save.mockImplementation(async (p) => ({ ...p, id: 'product-1' }) as Product);

      const result = await usecase.execute(baseDto);

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isAvailable: true, stock: 5, preparationTime: 0 }),
      );
      expect(logClient.success).toHaveBeenCalled();
      expect(result.message).toBe('Product created successfully');
      expect(result.product.id).toBe('product-1');
    });

    it('devrait forcer isAvailable à false quand le stock est à 0, même si isAvailable=true est demandé', async () => {
      categoryRepo.findById.mockResolvedValue(existingCategory);
      productRepo.save.mockImplementation(async (p) => p as Product);

      await usecase.execute({ ...baseDto, stock: 0, isAvailable: true });

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ stock: 0, isAvailable: false }),
      );
    });

    it('devrait respecter isAvailable=false explicite quand le stock est positif', async () => {
      categoryRepo.findById.mockResolvedValue(existingCategory);
      productRepo.save.mockImplementation(async (p) => p as Product);

      await usecase.execute({ ...baseDto, stock: 5, isAvailable: false });

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ stock: 5, isAvailable: false }),
      );
    });

    it('devrait utiliser 0 comme preparationTime par défaut', async () => {
      categoryRepo.findById.mockResolvedValue(existingCategory);
      productRepo.save.mockImplementation(async (p) => p as Product);

      await usecase.execute(baseDto);

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ preparationTime: 0 }),
      );
    });
  });
});
