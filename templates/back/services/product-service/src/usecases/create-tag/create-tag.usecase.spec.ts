import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CreateTagUseCase } from './create-tag.usecase';
import { ITagRepository } from '../../repositories/tag.repository';
import { CreateTagDto } from './create-tag.dto';
import { LogClient } from '../../services/log-client.service';
import { Tag } from '../../entities/tag.entity';

describe('CreateTagUseCase', () => {
  let usecase: CreateTagUseCase;
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
        CreateTagUseCase,
        { provide: ITagRepository, useValue: mockTagRepo },
        { provide: LogClient, useValue: mockLogClient },
      ],
    }).compile();

    usecase = module.get<CreateTagUseCase>(CreateTagUseCase);
    tagRepo = module.get(ITagRepository);
    logClient = module.get(LogClient);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait calculer le slug via generateSlug et vérifier son unicité', async () => {
      const dto: CreateTagDto = { name: 'Édition Spéciale' };
      tagRepo.findBySlug.mockResolvedValue(null);
      tagRepo.save.mockImplementation(async (t) => ({ ...t, id: 'tag-1' }) as Tag);

      await usecase.execute(dto);

      expect(tagRepo.findBySlug).toHaveBeenCalledWith('edition-speciale');
      expect(tagRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Édition Spéciale', slug: 'edition-speciale' }),
      );
    });

    it('devrait lever BadRequestException si le slug existe déjà, avec le slug dans le message', async () => {
      const dto: CreateTagDto = { name: 'Bio' };
      tagRepo.findBySlug.mockResolvedValue({ id: 'tag-1', slug: 'bio' } as Tag);

      await expect(usecase.execute(dto)).rejects.toThrow(BadRequestException);
      await expect(usecase.execute(dto)).rejects.toThrow('Tag already exists : bio');
      expect(logClient.warning).toHaveBeenCalled();
      expect(tagRepo.save).not.toHaveBeenCalled();
    });

    it('devrait retirer les espaces superflus du nom avant sauvegarde', async () => {
      const dto: CreateTagDto = { name: '  Bio  ' };
      tagRepo.findBySlug.mockResolvedValue(null);
      tagRepo.save.mockImplementation(async (t) => t as Tag);

      await usecase.execute(dto);

      expect(tagRepo.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Bio' }));
    });

    it('devrait retourner le tag créé avec un message de succès', async () => {
      const dto: CreateTagDto = { name: 'Bio' };
      const savedTag = { id: 'tag-1', name: 'Bio', slug: 'bio' } as Tag;
      tagRepo.findBySlug.mockResolvedValue(null);
      tagRepo.save.mockResolvedValue(savedTag);

      const result = await usecase.execute(dto);

      expect(logClient.success).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Tag created successfully', tag: savedTag });
    });
  });
});
