import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ListProductTagsUseCase } from './list-product-tags.usecase';
import { IProductRepository } from '../../repositories/product.repository';
import { ITagRepository } from '../../repositories/tag.repository';
import { Product } from '../../entities/product.entity';
import { Tag } from '../../entities/tag.entity';

describe('ListProductTagsUseCase', () => {
  let usecase: ListProductTagsUseCase;
  let productRepo: jest.Mocked<IProductRepository>;
  let tagRepo: jest.Mocked<ITagRepository>;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListProductTagsUseCase,
        { provide: IProductRepository, useValue: mockProductRepo },
        { provide: ITagRepository, useValue: mockTagRepo },
      ],
    }).compile();

    usecase = module.get<ListProductTagsUseCase>(ListProductTagsUseCase);
    productRepo = module.get(IProductRepository);
    tagRepo = module.get(ITagRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait lever NotFoundException si le produit n\'existe pas', async () => {
      productRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute('missing-product')).rejects.toThrow(NotFoundException);
      expect(tagRepo.findByProductId).not.toHaveBeenCalled();
    });

    it('devrait retourner les tags du produit', async () => {
      productRepo.findById.mockResolvedValue({ id: 'product-1' } as Product);
      const tags = [{ id: 'tag-1' }] as Tag[];
      tagRepo.findByProductId.mockResolvedValue(tags);

      const result = await usecase.execute('product-1');

      expect(result).toEqual({ message: 'Product tags fetched successfully', tags });
    });

    it('devrait retourner une liste vide sans erreur', async () => {
      productRepo.findById.mockResolvedValue({ id: 'product-1' } as Product);
      tagRepo.findByProductId.mockResolvedValue([]);

      const result = await usecase.execute('product-1');

      expect(result).toEqual({ message: 'Product tags fetched successfully', tags: [] });
    });
  });
});
