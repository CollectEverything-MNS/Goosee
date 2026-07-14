import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ListProductsByCategoryUseCase } from './list-products-by-category.usecase';
import { IProductRepository } from '../../repositories/product.repository';
import { ICategoryRepository } from '../../repositories/category.repository';
import { Category } from '../../entities/category.entity';
import { Product } from '../../entities/product.entity';

describe('ListProductsByCategoryUseCase', () => {
  let usecase: ListProductsByCategoryUseCase;
  let productRepo: jest.Mocked<IProductRepository>;
  let categoryRepo: jest.Mocked<ICategoryRepository>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListProductsByCategoryUseCase,
        { provide: IProductRepository, useValue: mockProductRepo },
        { provide: ICategoryRepository, useValue: mockCategoryRepo },
      ],
    }).compile();

    usecase = module.get<ListProductsByCategoryUseCase>(ListProductsByCategoryUseCase);
    productRepo = module.get(IProductRepository);
    categoryRepo = module.get(ICategoryRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait lever NotFoundException si la catégorie n\'existe pas', async () => {
      categoryRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute('missing-category')).rejects.toThrow(NotFoundException);
      await expect(usecase.execute('missing-category')).rejects.toThrow('Category not found');
      expect(productRepo.listByCategoryId).not.toHaveBeenCalled();
    });

    it('devrait retourner la catégorie et ses produits', async () => {
      const category = { id: 'category-1', name: 'Vins' } as Category;
      const products = [{ id: 'product-1' }] as Product[];
      categoryRepo.findById.mockResolvedValue(category);
      productRepo.listByCategoryId.mockResolvedValue(products);

      const result = await usecase.execute('category-1');

      expect(productRepo.listByCategoryId).toHaveBeenCalledWith('category-1');
      expect(result).toEqual({
        message: 'Products fetched successfully',
        category,
        products,
      });
    });
  });
});
