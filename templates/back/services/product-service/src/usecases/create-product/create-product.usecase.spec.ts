import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateProductUseCase } from './create-product.usecase';
import { IProductRepository } from '../../repositories/product.repository';
import { ICategoryRepository } from '../../repositories/category.repository';
import { CreateProductDto } from './create-product.dto';
import { LogClient } from '../../services/log-client.service';
import { StockClient } from '../../services/stock-client.service';
import { Category } from '../../entities/category.entity';
import { Product } from '../../entities/product.entity';

describe('CreateProductUseCase', () => {
  let usecase: CreateProductUseCase;
  let productRepo: jest.Mocked<IProductRepository>;
  let categoryRepo: jest.Mocked<ICategoryRepository>;
  let logClient: jest.Mocked<LogClient>;
  let stockClient: jest.Mocked<StockClient>;

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

  const mockStockClient = {
    productCreated: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProductUseCase,
        { provide: IProductRepository, useValue: mockProductRepo },
        { provide: ICategoryRepository, useValue: mockCategoryRepo },
        { provide: LogClient, useValue: mockLogClient },
        { provide: StockClient, useValue: mockStockClient },
      ],
    }).compile();

    usecase = module.get<CreateProductUseCase>(CreateProductUseCase);
    productRepo = module.get(IProductRepository);
    categoryRepo = module.get(ICategoryRepository);
    logClient = module.get(LogClient);
    stockClient = module.get(StockClient);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const existingCategory = { id: 'category-1', name: 'Vins' } as Category;

    const baseDto: CreateProductDto = {
      name: 'Château Margaux 2019',
      description: 'Grand vin de Bordeaux',
      price: 1299,
      categoryId: 'category-1',
    };

    it('devrait lever BadRequestException si aucune catégorie n\'est fournie', async () => {
      await expect(usecase.execute({ ...baseDto, categoryId: undefined })).rejects.toThrow(
        BadRequestException,
      );
      expect(productRepo.save).not.toHaveBeenCalled();
    });

    it('devrait lever NotFoundException si la catégorie n\'existe pas', async () => {
      categoryRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute(baseDto)).rejects.toThrow(NotFoundException);
      await expect(usecase.execute(baseDto)).rejects.toThrow(
        `Category not found : ${baseDto.categoryId}`,
      );
      expect(logClient.warning).toHaveBeenCalled();
      expect(productRepo.save).not.toHaveBeenCalled();
    });

    it('devrait créer un produit avec une seule catégorie (categoryId)', async () => {
      categoryRepo.findById.mockResolvedValue(existingCategory);
      productRepo.save.mockImplementation(async (p) => ({ ...p, id: 'product-1' }) as Product);

      const result = await usecase.execute(baseDto);

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 'category-1', categoryIds: ['category-1'] }),
      );
      expect(logClient.success).toHaveBeenCalled();
      expect(result.message).toBe('Product created successfully');
      expect(result.product.id).toBe('product-1');
    });

    it('devrait créer un produit avec plusieurs catégories (categoryIds)', async () => {
      categoryRepo.findById.mockResolvedValue(existingCategory);
      productRepo.save.mockImplementation(async (p) => p as Product);

      await usecase.execute({ ...baseDto, categoryId: undefined, categoryIds: ['category-1', 'category-2'] });

      expect(categoryRepo.findById).toHaveBeenCalledWith('category-1');
      expect(categoryRepo.findById).toHaveBeenCalledWith('category-2');
      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 'category-1', categoryIds: ['category-1', 'category-2'] }),
      );
    });

    it('devrait dédupliquer les categoryIds fournis en double', async () => {
      categoryRepo.findById.mockResolvedValue(existingCategory);
      productRepo.save.mockImplementation(async (p) => p as Product);

      await usecase.execute({ ...baseDto, categoryId: undefined, categoryIds: ['category-1', 'category-1'] });

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ categoryIds: ['category-1'] }),
      );
    });

    it('devrait lever NotFoundException si une des catégories multiples n\'existe pas', async () => {
      categoryRepo.findById.mockImplementation(async (id) =>
        id === 'category-1' ? existingCategory : null,
      );

      await expect(
        usecase.execute({ ...baseDto, categoryId: undefined, categoryIds: ['category-1', 'missing'] }),
      ).rejects.toThrow(NotFoundException);
      expect(productRepo.save).not.toHaveBeenCalled();
    });

    it('devrait émettre productCreated avec le stock initial fourni', async () => {
      categoryRepo.findById.mockResolvedValue(existingCategory);
      productRepo.save.mockImplementation(async (p) => ({ ...p, id: 'product-1' }) as Product);

      await usecase.execute({ ...baseDto, initialStock: 20 });

      expect(stockClient.productCreated).toHaveBeenCalledWith('product-1', 20);
    });

    it('devrait émettre productCreated même sans stock initial fourni', async () => {
      categoryRepo.findById.mockResolvedValue(existingCategory);
      productRepo.save.mockImplementation(async (p) => ({ ...p, id: 'product-1' }) as Product);

      await usecase.execute(baseDto);

      expect(stockClient.productCreated).toHaveBeenCalledWith('product-1', undefined);
    });

    it('devrait respecter isAvailable=false explicite', async () => {
      categoryRepo.findById.mockResolvedValue(existingCategory);
      productRepo.save.mockImplementation(async (p) => p as Product);

      await usecase.execute({ ...baseDto, isAvailable: false });

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isAvailable: false }),
      );
    });

    it('devrait utiliser isAvailable=true par défaut', async () => {
      categoryRepo.findById.mockResolvedValue(existingCategory);
      productRepo.save.mockImplementation(async (p) => p as Product);

      await usecase.execute(baseDto);

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isAvailable: true }),
      );
    });
  });
});
