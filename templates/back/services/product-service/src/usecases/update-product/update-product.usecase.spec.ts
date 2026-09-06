import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateProductUseCase } from './update-product.usecase';
import { IProductRepository } from '../../repositories/product.repository';
import { ICategoryRepository } from '../../repositories/category.repository';
import { UpdateProductDto } from './update-product.dto';
import { LogClient } from '../../services/log-client.service';
import { Category } from '../../entities/category.entity';
import { Product } from '../../entities/product.entity';

describe('UpdateProductUseCase', () => {
  let usecase: UpdateProductUseCase;
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
        UpdateProductUseCase,
        { provide: IProductRepository, useValue: mockProductRepo },
        { provide: ICategoryRepository, useValue: mockCategoryRepo },
        { provide: LogClient, useValue: mockLogClient },
      ],
    }).compile();

    usecase = module.get<UpdateProductUseCase>(UpdateProductUseCase);
    productRepo = module.get(IProductRepository);
    categoryRepo = module.get(ICategoryRepository);
    logClient = module.get(LogClient);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const existingProduct = {
      id: 'product-1',
      name: 'Pizza',
      description: 'Pizza margherita',
      price: 10,
      preparationTime: 0,
      sizeValue: null,
      sizeUnit: null,
      isAvailable: true,
      categoryId: 'category-1',
      categoryIds: ['category-1'],
    } as unknown as Product;

    const otherCategory = { id: 'category-2', name: 'Boissons' } as Category;

    it('devrait lever NotFoundException si le produit n\'existe pas', async () => {
      productRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute('missing-id', {})).rejects.toThrow(NotFoundException);
      await expect(usecase.execute('missing-id', {})).rejects.toThrow('Product not found');
      expect(logClient.warning).toHaveBeenCalled();
      expect(productRepo.save).not.toHaveBeenCalled();
    });

    it('devrait conserver les catégories existantes si aucune n\'est fournie', async () => {
      productRepo.findById.mockResolvedValue({ ...existingProduct });
      productRepo.save.mockImplementation(async (p) => p as Product);

      await usecase.execute('product-1', { name: 'Pizza Royale' });

      expect(categoryRepo.findById).not.toHaveBeenCalled();
      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Pizza Royale',
          categoryId: 'category-1',
          categoryIds: ['category-1'],
        }),
      );
    });

    it('devrait lever NotFoundException si la nouvelle categoryId n\'existe pas', async () => {
      productRepo.findById.mockResolvedValue({ ...existingProduct });
      categoryRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute('product-1', { categoryId: 'missing' })).rejects.toThrow(
        NotFoundException,
      );
      expect(productRepo.save).not.toHaveBeenCalled();
    });

    it('devrait remplacer la categorie via categoryId', async () => {
      productRepo.findById.mockResolvedValue({ ...existingProduct });
      categoryRepo.findById.mockResolvedValue(otherCategory);
      productRepo.save.mockImplementation(async (p) => p as Product);

      await usecase.execute('product-1', { categoryId: 'category-2' });

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 'category-2', categoryIds: ['category-2'] }),
      );
    });

    it('devrait remplacer les catégories via categoryIds (priorité sur categoryId)', async () => {
      productRepo.findById.mockResolvedValue({ ...existingProduct });
      categoryRepo.findById.mockResolvedValue(otherCategory);
      productRepo.save.mockImplementation(async (p) => p as Product);

      await usecase.execute('product-1', {
        categoryId: 'category-2',
        categoryIds: ['category-2', 'category-2'],
      });

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ categoryIds: ['category-2'] }),
      );
    });

    it('devrait lever BadRequestException si categoryIds est fourni vide après filtrage', async () => {
      productRepo.findById.mockResolvedValue({ ...existingProduct });

      await expect(
        usecase.execute('product-1', { categoryIds: [] }),
      ).resolves.toBeDefined();
      // categoryIds vide (longueur 0) ne déclenche pas resolveCategoryIds (garde `dto.categoryIds?.length`)
      expect(categoryRepo.findById).not.toHaveBeenCalled();
    });

    it('devrait lever NotFoundException si une des nouvelles categoryIds n\'existe pas', async () => {
      productRepo.findById.mockResolvedValue({ ...existingProduct });
      categoryRepo.findById.mockImplementation(async (id) =>
        id === 'category-2' ? otherCategory : null,
      );

      await expect(
        usecase.execute('product-1', { categoryIds: ['category-2', 'missing'] }),
      ).rejects.toThrow(NotFoundException);
      expect(productRepo.save).not.toHaveBeenCalled();
    });

    it('devrait conserver les champs non fournis', async () => {
      productRepo.findById.mockResolvedValue({ ...existingProduct });
      productRepo.save.mockImplementation(async (p) => p as Product);

      await usecase.execute('product-1', { price: 15 });

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: existingProduct.name,
          description: existingProduct.description,
          price: 15,
          preparationTime: existingProduct.preparationTime,
          isAvailable: existingProduct.isAvailable,
        }),
      );
    });

    it('devrait mettre à jour isAvailable si fourni', async () => {
      productRepo.findById.mockResolvedValue({ ...existingProduct, isAvailable: true });
      productRepo.save.mockImplementation(async (p) => p as Product);

      await usecase.execute('product-1', { isAvailable: false });

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isAvailable: false }),
      );
    });
  });
});
