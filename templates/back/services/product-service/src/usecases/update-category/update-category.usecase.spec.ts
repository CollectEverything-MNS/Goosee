import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateCategoryUseCase } from './update-category.usecase';
import { ICategoryRepository } from '../../repositories/category.repository';
import { UpdateCategoryDto } from './update-category.dto';
import { LogClient } from '../../services/log-client.service';
import { Category } from '../../entities/category.entity';

describe('UpdateCategoryUseCase', () => {
  let usecase: UpdateCategoryUseCase;
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
        UpdateCategoryUseCase,
        { provide: ICategoryRepository, useValue: mockCategoryRepo },
        { provide: LogClient, useValue: mockLogClient },
      ],
    }).compile();

    usecase = module.get<UpdateCategoryUseCase>(UpdateCategoryUseCase);
    categoryRepo = module.get(ICategoryRepository);
    logClient = module.get(LogClient);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const rootCategory = {
      id: 'category-1',
      name: 'Vins',
      description: null,
      imageUrl: null,
      parentId: null,
      order: 0,
      isActive: true,
    } as unknown as Category;

    it('devrait lever NotFoundException si la catégorie n\'existe pas', async () => {
      categoryRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute('missing-id', {})).rejects.toThrow(NotFoundException);
      expect(logClient.warning).toHaveBeenCalled();
      expect(categoryRepo.save).not.toHaveBeenCalled();
    });

    it('devrait lever NotFoundException si la nouvelle catégorie parente n\'existe pas', async () => {
      categoryRepo.findById.mockResolvedValueOnce({ ...rootCategory }).mockResolvedValueOnce(null);

      const dto: UpdateCategoryDto = { parentId: 'missing-parent' };

      await expect(usecase.execute('category-1', dto)).rejects.toThrow(NotFoundException);
      expect(categoryRepo.save).not.toHaveBeenCalled();
    });

    it('devrait lever BadRequestException si le nouveau parent a lui-même un parent', async () => {
      categoryRepo.findById
        .mockResolvedValueOnce({ ...rootCategory })
        .mockResolvedValueOnce({ id: 'parent-1', parentId: 'grandparent-1' } as Category);

      const dto: UpdateCategoryDto = { parentId: 'parent-1' };

      await expect(usecase.execute('category-1', dto)).rejects.toThrow(BadRequestException);
      expect(categoryRepo.save).not.toHaveBeenCalled();
    });

    it('devrait accepter une nouvelle catégorie parente valide (racine, sans son propre parent)', async () => {
      categoryRepo.findById
        .mockResolvedValueOnce({ ...rootCategory })
        .mockResolvedValueOnce({ id: 'parent-1', parentId: null } as Category);
      categoryRepo.save.mockImplementation(async (c) => c as Category);

      await usecase.execute('category-1', { parentId: 'parent-1' });

      expect(categoryRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ parentId: 'parent-1' }),
      );
    });

    it('ne devrait pas re-vérifier le parent si parentId ne change pas', async () => {
      const child = { ...rootCategory, parentId: 'parent-1' };
      categoryRepo.findById.mockResolvedValue(child);
      categoryRepo.save.mockImplementation(async (c) => c as Category);

      await usecase.execute('category-1', { parentId: 'parent-1', name: 'Vins Blancs' });

      expect(categoryRepo.findById).toHaveBeenCalledTimes(1);
      expect(categoryRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Vins Blancs' }),
      );
    });

    it('devrait mettre à jour les champs simples sans cascade', async () => {
      categoryRepo.findById.mockResolvedValue({ ...rootCategory });
      categoryRepo.save.mockImplementation(async (c) => c as Category);

      await usecase.execute('category-1', { name: 'Nouveau nom' });

      expect(categoryRepo.listByParentId).not.toHaveBeenCalled();
      expect(categoryRepo.save).toHaveBeenCalledTimes(1);
      expect(categoryRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Nouveau nom' }),
      );
    });

    it('devrait désactiver en cascade les enfants quand une catégorie racine active passe inactive', async () => {
      categoryRepo.findById.mockResolvedValue({ ...rootCategory, isActive: true });
      const children = [
        { id: 'child-1', isActive: true } as Category,
        { id: 'child-2', isActive: true } as Category,
      ];
      categoryRepo.listByParentId.mockResolvedValue(children);
      categoryRepo.save.mockImplementation(async (c) => c as Category);

      await usecase.execute('category-1', { isActive: false });

      expect(categoryRepo.listByParentId).toHaveBeenCalledWith('category-1');
      expect(categoryRepo.save).toHaveBeenCalledTimes(3); // 2 enfants + la catégorie elle-même
      expect(categoryRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'child-1', isActive: false }),
      );
      expect(categoryRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'child-2', isActive: false }),
      );
    });

    it('ne devrait pas cascader si la catégorie n\'est pas racine', async () => {
      categoryRepo.findById.mockResolvedValue({
        ...rootCategory,
        parentId: 'parent-1',
        isActive: true,
      });
      categoryRepo.save.mockImplementation(async (c) => c as Category);

      await usecase.execute('category-1', { isActive: false });

      expect(categoryRepo.listByParentId).not.toHaveBeenCalled();
      expect(categoryRepo.save).toHaveBeenCalledTimes(1);
    });

    it('ne devrait pas cascader quand isActive passe de false à true', async () => {
      categoryRepo.findById.mockResolvedValue({ ...rootCategory, isActive: false });
      categoryRepo.save.mockImplementation(async (c) => c as Category);

      await usecase.execute('category-1', { isActive: true });

      expect(categoryRepo.listByParentId).not.toHaveBeenCalled();
      expect(categoryRepo.save).toHaveBeenCalledTimes(1);
    });

    it('ne devrait pas cascader si la catégorie est déjà inactive', async () => {
      categoryRepo.findById.mockResolvedValue({ ...rootCategory, isActive: false });
      categoryRepo.save.mockImplementation(async (c) => c as Category);

      await usecase.execute('category-1', { isActive: false });

      expect(categoryRepo.listByParentId).not.toHaveBeenCalled();
      expect(categoryRepo.save).toHaveBeenCalledTimes(1);
    });
  });
});
