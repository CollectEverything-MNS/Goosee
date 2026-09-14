import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DeleteCategoryUseCase } from './delete-category.usecase';
import { ICategoryRepository } from '../../repositories/category.repository';
import { IProductRepository } from '../../repositories/product.repository';
import { LogClient } from '../../services/log-client.service';
import { Category } from '../../entities/category.entity';

describe('DeleteCategoryUseCase', () => {
  let usecase: DeleteCategoryUseCase;
  let categoryRepo: jest.Mocked<ICategoryRepository>;
  let productRepo: jest.Mocked<IProductRepository>;
  let logClient: jest.Mocked<LogClient>;

  const mockCategoryRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    listByParentId: jest.fn(),
    hasProducts: jest.fn(),
    softDelete: jest.fn(),
  };

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
        DeleteCategoryUseCase,
        { provide: ICategoryRepository, useValue: mockCategoryRepo },
        { provide: IProductRepository, useValue: mockProductRepo },
        { provide: LogClient, useValue: mockLogClient },
      ],
    }).compile();

    usecase = module.get<DeleteCategoryUseCase>(DeleteCategoryUseCase);
    categoryRepo = module.get(ICategoryRepository);
    productRepo = module.get(IProductRepository);
    logClient = module.get(LogClient);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait lever NotFoundException si la catégorie n\'existe pas', async () => {
      categoryRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute('missing-id')).rejects.toThrow(NotFoundException);
      expect(logClient.warning).toHaveBeenCalled();
      expect(productRepo.countByCategoryId).not.toHaveBeenCalled();
    });

    it('devrait lever BadRequestException si des produits sont rattachés, avec le nombre dans le message', async () => {
      categoryRepo.findById.mockResolvedValue({ id: 'category-1', name: 'Vins' } as Category);
      productRepo.countByCategoryId.mockResolvedValue(3);

      await expect(usecase.execute('category-1')).rejects.toThrow(BadRequestException);
      await expect(usecase.execute('category-1')).rejects.toThrow(/3 product/);
      expect(logClient.warning).toHaveBeenCalled();
      expect(categoryRepo.softDelete).not.toHaveBeenCalled();
    });

    it('devrait supprimer (soft delete) la catégorie si aucun produit n\'y est rattaché', async () => {
      categoryRepo.findById.mockResolvedValue({ id: 'category-1', name: 'Vins' } as Category);
      productRepo.countByCategoryId.mockResolvedValue(0);

      const result = await usecase.execute('category-1');

      expect(categoryRepo.softDelete).toHaveBeenCalledWith('category-1');
      expect(logClient.success).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Category deleted successfully' });
    });
  });
});
