import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetCategoryUseCase } from './get-category.usecase';
import { ICategoryRepository } from '../../repositories/category.repository';
import { Category } from '../../entities/category.entity';

describe('GetCategoryUseCase', () => {
  let usecase: GetCategoryUseCase;
  let categoryRepo: jest.Mocked<ICategoryRepository>;

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
        GetCategoryUseCase,
        { provide: ICategoryRepository, useValue: mockCategoryRepo },
      ],
    }).compile();

    usecase = module.get<GetCategoryUseCase>(GetCategoryUseCase);
    categoryRepo = module.get(ICategoryRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait lever NotFoundException si la catégorie n\'existe pas', async () => {
      categoryRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute('missing-id')).rejects.toThrow(NotFoundException);
      await expect(usecase.execute('missing-id')).rejects.toThrow('Category not found');
    });

    it('devrait retourner la catégorie trouvée', async () => {
      const category = { id: 'category-1', name: 'Vins' } as Category;
      categoryRepo.findById.mockResolvedValue(category);

      const result = await usecase.execute('category-1');

      expect(result).toEqual({ message: 'Category fetched successfully', category });
    });
  });
});
