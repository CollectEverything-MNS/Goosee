import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteTagUseCase } from './delete-tag.usecase';
import { ITagRepository } from '../../repositories/tag.repository';
import { LogClient } from '../../services/log-client.service';
import { Tag } from '../../entities/tag.entity';

describe('DeleteTagUseCase', () => {
  let usecase: DeleteTagUseCase;
  let tagRepo: jest.Mocked<ITagRepository>;
  let logClient: jest.Mocked<LogClient>;

  const mockTagRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    list: jest.fn(),
    findByProductId: jest.fn(),
    deleteById: jest.fn(),
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
        DeleteTagUseCase,
        { provide: ITagRepository, useValue: mockTagRepo },
        { provide: LogClient, useValue: mockLogClient },
      ],
    }).compile();

    usecase = module.get<DeleteTagUseCase>(DeleteTagUseCase);
    tagRepo = module.get(ITagRepository);
    logClient = module.get(LogClient);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait lever NotFoundException si le tag n\'existe pas', async () => {
      tagRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute('missing-id')).rejects.toThrow(NotFoundException);
      expect(logClient.warning).toHaveBeenCalled();
      expect(tagRepo.deleteById).not.toHaveBeenCalled();
    });

    it('devrait supprimer (hard delete) le tag et retourner un message', async () => {
      tagRepo.findById.mockResolvedValue({ id: 'tag-1', name: 'Bio' } as Tag);

      const result = await usecase.execute('tag-1');

      expect(tagRepo.deleteById).toHaveBeenCalledWith('tag-1');
      expect(logClient.success).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Tag deleted successfully' });
    });
  });
});
