import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetProductUseCase } from './get-product.usecase';
import { IProductRepository } from '../../repositories/product.repository';
import { IProductImageRepository } from '../../repositories/product-image.repository';
import { ITagRepository } from '../../repositories/tag.repository';
import { IProductAttributeRepository } from '../../repositories/product-attribute.repository';
import { Product } from '../../entities/product.entity';

describe('GetProductUseCase', () => {
  let usecase: GetProductUseCase;
  let productRepo: jest.Mocked<IProductRepository>;
  let imageRepo: jest.Mocked<IProductImageRepository>;
  let tagRepo: jest.Mocked<ITagRepository>;
  let attributeRepo: jest.Mocked<IProductAttributeRepository>;

  const mockProductRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    listByCategoryId: jest.fn(),
    countByCategoryId: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockImageRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    listByProductId: jest.fn(),
    clearMainByProductId: jest.fn(),
    deleteById: jest.fn(),
  };

  const mockTagRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    list: jest.fn(),
    findByProductId: jest.fn(),
    deleteById: jest.fn(),
  };

  const mockAttributeRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    listByProductId: jest.fn(),
    deleteById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductUseCase,
        { provide: IProductRepository, useValue: mockProductRepo },
        { provide: IProductImageRepository, useValue: mockImageRepo },
        { provide: ITagRepository, useValue: mockTagRepo },
        { provide: IProductAttributeRepository, useValue: mockAttributeRepo },
      ],
    }).compile();

    usecase = module.get<GetProductUseCase>(GetProductUseCase);
    productRepo = module.get(IProductRepository);
    imageRepo = module.get(IProductImageRepository);
    tagRepo = module.get(ITagRepository);
    attributeRepo = module.get(IProductAttributeRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const existingProduct = { id: 'product-1', name: 'Pizza' } as Product;

    it('devrait lever NotFoundException si le produit n\'existe pas', async () => {
      productRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute('missing-id')).rejects.toThrow(NotFoundException);
      await expect(usecase.execute('missing-id')).rejects.toThrow('Product not found');
      expect(imageRepo.listByProductId).not.toHaveBeenCalled();
    });

    it('devrait récupérer images, tags et attributs en parallèle et les fusionner', async () => {
      productRepo.findById.mockResolvedValue(existingProduct);
      imageRepo.listByProductId.mockResolvedValue([{ id: 'image-1' }] as never);
      tagRepo.findByProductId.mockResolvedValue([{ id: 'tag-1' }] as never);
      attributeRepo.listByProductId.mockResolvedValue([{ id: 'attribute-1' }] as never);

      const result = await usecase.execute('product-1');

      expect(imageRepo.listByProductId).toHaveBeenCalledWith('product-1');
      expect(tagRepo.findByProductId).toHaveBeenCalledWith('product-1');
      expect(attributeRepo.listByProductId).toHaveBeenCalledWith('product-1');
      expect(result).toEqual({
        message: 'Product fetched successfully',
        product: {
          id: 'product-1',
          name: 'Pizza',
          images: [{ id: 'image-1' }],
          tags: [{ id: 'tag-1' }],
          attributes: [{ id: 'attribute-1' }],
        },
      });
    });
  });
});
