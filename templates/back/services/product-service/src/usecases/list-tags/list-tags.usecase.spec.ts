import { Test, TestingModule } from '@nestjs/testing';
import { ListTagsUseCase } from './list-tags.usecase';
import { ITagRepository } from '../../repositories/tag.repository';
import { Tag } from '../../entities/tag.entity';

describe('ListTagsUseCase', () => {
  let usecase: ListTagsUseCase;
  let tagRepo: jest.Mocked<ITagRepository>;

  const mockTagRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    list: jest.fn(),
    findByProductId: jest.fn(),
    deleteById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListTagsUseCase, { provide: ITagRepository, useValue: mockTagRepo }],
    }).compile();

    usecase = module.get<ListTagsUseCase>(ListTagsUseCase);
    tagRepo = module.get(ITagRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait retourner la liste des tags', async () => {
      const tags = [{ id: 'tag-1' }, { id: 'tag-2' }] as Tag[];
      tagRepo.list.mockResolvedValue(tags);

      const result = await usecase.execute();

      expect(result).toEqual({ message: 'Tags fetched successfully', tags });
    });

    it('devrait retourner une liste vide sans erreur', async () => {
      tagRepo.list.mockResolvedValue([]);

      const result = await usecase.execute();

      expect(result).toEqual({ message: 'Tags fetched successfully', tags: [] });
    });
  });
});
