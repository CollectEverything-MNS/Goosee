import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AddProductTagUseCase } from './add-product-tag.usecase';
import { IProductRepository } from '../../repositories/product.repository';
import { ITagRepository } from '../../repositories/tag.repository';
import { IProductTagRepository } from '../../repositories/product-tag.repository';
import { AddProductTagDto } from './add-product-tag.dto';
import { LogClient } from '../../services/log-client.service';
import { Product } from '../../entities/product.entity';
import { Tag } from '../../entities/tag.entity';
import { ProductTag } from '../../entities/product-tag.entity';

describe('AddProductTagUseCase', () => {
  let usecase: AddProductTagUseCase;
  let productRepo: jest.Mocked<IProductRepository>;
  let tagRepo: jest.Mocked<ITagRepository>;
  let productTagRepo: jest.Mocked<IProductTagRepository>;
  let logClient: jest.Mocked<LogClient>;

  const mockProductRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    listByCategoryId: jest.fn(),
    countByCategoryId: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockTagRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    list: jest.fn(),
    findByProductId: jest.fn(),
    deleteById: jest.fn(),
  };

  const mockProductTagRepo = {
    save: jest.fn(),
    findByProductId: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
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
        AddProductTagUseCase,
        { provide: IProductRepository, useValue: mockProductRepo },
        { provide: ITagRepository, useValue: mockTagRepo },
        { provide: IProductTagRepository, useValue: mockProductTagRepo },
        { provide: LogClient, useValue: mockLogClient },
      ],
    }).compile();

    usecase = module.get<AddProductTagUseCase>(AddProductTagUseCase);
    productRepo = module.get(IProductRepository);
    tagRepo = module.get(ITagRepository);
    productTagRepo = module.get(IProductTagRepository);
    logClient = module.get(LogClient);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const dto: AddProductTagDto = { tagId: 'tag-1' };

    it('devrait lever NotFoundException si le produit n\'existe pas', async () => {
      productRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute('missing-product', dto)).rejects.toThrow(NotFoundException);
      expect(tagRepo.findById).not.toHaveBeenCalled();
    });

    it('devrait lever NotFoundException si le tag n\'existe pas', async () => {
      productRepo.findById.mockResolvedValue({ id: 'product-1' } as Product);
      tagRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute('product-1', dto)).rejects.toThrow(NotFoundException);
      expect(productTagRepo.findOne).not.toHaveBeenCalled();
    });

    it('devrait lever BadRequestException si la relation existe déjà', async () => {
      productRepo.findById.mockResolvedValue({ id: 'product-1' } as Product);
      tagRepo.findById.mockResolvedValue({ id: 'tag-1', name: 'Bio' } as Tag);
      productTagRepo.findOne.mockResolvedValue({ productId: 'product-1', tagId: 'tag-1' } as ProductTag);

      await expect(usecase.execute('product-1', dto)).rejects.toThrow(BadRequestException);
      expect(productTagRepo.save).not.toHaveBeenCalled();
    });

    it('devrait ajouter le tag au produit', async () => {
      productRepo.findById.mockResolvedValue({ id: 'product-1', name: 'Pizza' } as Product);
      const tag = { id: 'tag-1', name: 'Bio' } as Tag;
      tagRepo.findById.mockResolvedValue(tag);
      productTagRepo.findOne.mockResolvedValue(null);

      const result = await usecase.execute('product-1', dto);

      expect(productTagRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ productId: 'product-1', tagId: 'tag-1' }),
      );
      expect(logClient.success).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Tag added to product successfully', tag });
    });
  });
});
