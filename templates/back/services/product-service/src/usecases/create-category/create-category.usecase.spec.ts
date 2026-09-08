import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateCategoryUseCase } from './create-category.usecase';
import { ICategoryRepository } from '../../repositories/category.repository';
import { CreateCategoryDto } from './create-category.dto';
import { LogClient } from '../../services/log-client.service';
import { Category } from '../../entities/category.entity';

describe('CreateCategoryUseCase', () => {
  let usecase: CreateCategoryUseCase;
  let categoryRepo: jest.Mocked<ICategoryRepository>;
  let logClient: jest.Mocked<LogClient>;

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
        CreateCategoryUseCase,
        { provide: ICategoryRepository, useValue: mockCategoryRepo },
        { provide: LogClient, useValue: mockLogClient },
      ],
    }).compile();

    usecase = module.get<CreateCategoryUseCase>(CreateCategoryUseCase);
    categoryRepo = module.get(ICategoryRepository);
    logClient = module.get(LogClient);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const baseDto: CreateCategoryDto = { name: 'Vins Rouges' };

    it('devrait créer une catégorie racine sans parent', async () => {
      categoryRepo.save.mockImplementation(async (c) => ({ ...c, id: 'category-1' }) as Category);

      const result = await usecase.execute(baseDto);

      expect(categoryRepo.findById).not.toHaveBeenCalled();
      expect(categoryRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true, order: 0 }),
      );
      expect(logClient.success).toHaveBeenCalled();
      expect(result.message).toBe('Category created successfully');
    });

    it('devrait lever NotFoundException si la catégorie parente n\'existe pas', async () => {
      categoryRepo.findById.mockResolvedValue(null);

      const dto: CreateCategoryDto = { ...baseDto, parentId: 'missing-parent' };

      await expect(usecase.execute(dto)).rejects.toThrow(NotFoundException);
      expect(categoryRepo.save).not.toHaveBeenCalled();
    });

    it('devrait créer une sous-catégorie sous un parent racine', async () => {
      categoryRepo.findById.mockResolvedValue({ id: 'parent-1', parentId: null } as Category);
      categoryRepo.save.mockImplementation(async (c) => ({ ...c, id: 'category-1' }) as Category);

      const dto: CreateCategoryDto = { ...baseDto, parentId: 'parent-1' };

      await usecase.execute(dto);

      expect(categoryRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ parentId: 'parent-1' }),
      );
    });

    it('devrait lever BadRequestException si le parent a lui-même un parent (3 niveaux refusés)', async () => {
      categoryRepo.findById.mockResolvedValue({
        id: 'parent-1',
        parentId: 'grandparent-1',
      } as Category);

      const dto: CreateCategoryDto = { ...baseDto, parentId: 'parent-1' };

      await expect(usecase.execute(dto)).rejects.toThrow(BadRequestException);
      expect(logClient.warning).toHaveBeenCalled();
      expect(categoryRepo.save).not.toHaveBeenCalled();
    });

    it('devrait utiliser des valeurs par défaut pour order et isActive', async () => {
      categoryRepo.save.mockImplementation(async (c) => c as Category);

      await usecase.execute(baseDto);

      expect(categoryRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ order: 0, isActive: true }),
      );
    });
  });
});
