import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
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
      stock: 5,
      preparationTime: 0,
      sizeValue: null,
      sizeUnit: null,
      isAvailable: true,
      categoryId: 'category-1',
    } as unknown as Product;

    it('devrait lever NotFoundException si le produit n\'existe pas', async () => {
      productRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute('missing-id', {})).rejects.toThrow(NotFoundException);
      await expect(usecase.execute('missing-id', {})).rejects.toThrow('Product not found');
      expect(logClient.warning).toHaveBeenCalled();
      expect(productRepo.save).not.toHaveBeenCalled();
    });

    it('devrait lever NotFoundException si la nouvelle catégorie n\'existe pas', async () => {
      productRepo.findById.mockResolvedValue({ ...existingProduct });
      categoryRepo.findById.mockResolvedValue(null);

      const dto: UpdateProductDto = { categoryId: 'category-2' };

      await expect(usecase.execute('product-1', dto)).rejects.toThrow(NotFoundException);
      expect(categoryRepo.findById).toHaveBeenCalledWith('category-2');
      expect(productRepo.save).not.toHaveBeenCalled();
    });

    it('ne devrait pas re-vérifier la catégorie si categoryId ne change pas', async () => {
      productRepo.findById.mockResolvedValue({ ...existingProduct });
      productRepo.save.mockImplementation(async (p) => p as Product);

      const dto: UpdateProductDto = { categoryId: 'category-1', name: 'Pizza Royale' };

      await usecase.execute('product-1', dto);

      expect(categoryRepo.findById).not.toHaveBeenCalled();
      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Pizza Royale', categoryId: 'category-1' }),
      );
    });

    it('devrait accepter une nouvelle catégorie existante', async () => {
      productRepo.findById.mockResolvedValue({ ...existingProduct });
      categoryRepo.findById.mockResolvedValue({ id: 'category-2' } as Category);
      productRepo.save.mockImplementation(async (p) => p as Product);

      await usecase.execute('product-1', { categoryId: 'category-2' });

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 'category-2' }),
      );
    });

    it('devrait forcer isAvailable à false quand le nouveau stock est 0, même si isAvailable=true est demandé', async () => {
      productRepo.findById.mockResolvedValue({ ...existingProduct });
      productRepo.save.mockImplementation(async (p) => p as Product);

      await usecase.execute('product-1', { stock: 0, isAvailable: true });

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ stock: 0, isAvailable: false }),
      );
    });

    it('devrait conserver isAvailable existant si stock non fourni et positif', async () => {
      productRepo.findById.mockResolvedValue({ ...existingProduct, isAvailable: true });
      productRepo.save.mockImplementation(async (p) => p as Product);

      await usecase.execute('product-1', { name: 'Pizza Royale' });

      expect(productRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ stock: 5, isAvailable: true, name: 'Pizza Royale' }),
      );
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
        }),
      );
    });
  });
});
