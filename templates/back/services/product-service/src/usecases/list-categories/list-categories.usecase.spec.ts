import { Test, TestingModule } from '@nestjs/testing';
import { ListCategoriesUseCase } from './list-categories.usecase';
import { ICategoryRepository } from '../../repositories/category.repository';
import { Category } from '../../entities/category.entity';

describe('ListCategoriesUseCase', () => {
  let usecase: ListCategoriesUseCase;
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
        ListCategoriesUseCase,
        { provide: ICategoryRepository, useValue: mockCategoryRepo },
      ],
    }).compile();

    usecase = module.get<ListCategoriesUseCase>(ListCategoriesUseCase);
    categoryRepo = module.get(ICategoryRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait retourner la liste des catégories', async () => {
      const categories = [{ id: 'category-1' }, { id: 'category-2' }] as Category[];
      categoryRepo.list.mockResolvedValue(categories);

      const result = await usecase.execute();

      expect(result).toEqual({ message: 'Categories fetched successfully', categories });
    });

    it('devrait retourner une liste vide sans erreur', async () => {
      categoryRepo.list.mockResolvedValue([]);

      const result = await usecase.execute();

      expect(result).toEqual({ message: 'Categories fetched successfully', categories: [] });
    });
  });
});
