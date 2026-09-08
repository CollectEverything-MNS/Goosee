import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ListProductAttributesUseCase } from './list-product-attributes.usecase';
import { IProductRepository } from '../../repositories/product.repository';
import { IProductAttributeRepository } from '../../repositories/product-attribute.repository';
import { Product } from '../../entities/product.entity';
import { ProductAttribute } from '../../entities/product-attribute.entity';

describe('ListProductAttributesUseCase', () => {
  let usecase: ListProductAttributesUseCase;
  let productRepo: jest.Mocked<IProductRepository>;
  let attributeRepo: jest.Mocked<IProductAttributeRepository>;

  const mockProductRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    listByCategoryId: jest.fn(),
    countByCategoryId: jest.fn(),
    softDelete: jest.fn(),
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
        ListProductAttributesUseCase,
        { provide: IProductRepository, useValue: mockProductRepo },
        { provide: IProductAttributeRepository, useValue: mockAttributeRepo },
      ],
    }).compile();

    usecase = module.get<ListProductAttributesUseCase>(ListProductAttributesUseCase);
    productRepo = module.get(IProductRepository);
    attributeRepo = module.get(IProductAttributeRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait lever NotFoundException si le produit n\'existe pas', async () => {
      productRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute('missing-product')).rejects.toThrow(NotFoundException);
      expect(attributeRepo.listByProductId).not.toHaveBeenCalled();
    });

    it('devrait retourner les attributs du produit', async () => {
      productRepo.findById.mockResolvedValue({ id: 'product-1' } as Product);
      const attributes = [{ id: 'attribute-1' }] as ProductAttribute[];
      attributeRepo.listByProductId.mockResolvedValue(attributes);

      const result = await usecase.execute('product-1');

      expect(attributeRepo.listByProductId).toHaveBeenCalledWith('product-1');
      expect(result).toEqual({ message: 'Product attributes fetched successfully', attributes });
    });
  });
});
