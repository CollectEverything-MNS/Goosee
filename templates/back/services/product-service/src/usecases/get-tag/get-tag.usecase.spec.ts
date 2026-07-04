import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetTagUseCase } from './get-tag.usecase';
import { ITagRepository } from '../../repositories/tag.repository';
import { Tag } from '../../entities/tag.entity';

describe('GetTagUseCase', () => {
  let usecase: GetTagUseCase;
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
      providers: [GetTagUseCase, { provide: ITagRepository, useValue: mockTagRepo }],
    }).compile();

    usecase = module.get<GetTagUseCase>(GetTagUseCase);
    tagRepo = module.get(ITagRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait lever NotFoundException si le tag n\'existe pas', async () => {
      tagRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute('missing-id')).rejects.toThrow(NotFoundException);
      await expect(usecase.execute('missing-id')).rejects.toThrow('Tag not found');
    });

    it('devrait retourner le tag trouvé', async () => {
      const tag = { id: 'tag-1', name: 'Bio' } as Tag;
      tagRepo.findById.mockResolvedValue(tag);

      const result = await usecase.execute('tag-1');

      expect(result).toEqual({ message: 'Tag fetched successfully', tag });
    });
  });
});
