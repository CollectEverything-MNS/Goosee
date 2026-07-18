import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GetProductAttributeUseCase } from './get-product-attribute.usecase';
import { IProductAttributeRepository } from '../../repositories/product-attribute.repository';
import { ProductAttribute } from '../../entities/product-attribute.entity';

describe('GetProductAttributeUseCase', () => {
  let usecase: GetProductAttributeUseCase;
  let attributeRepo: jest.Mocked<IProductAttributeRepository>;

  const mockAttributeRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    listByProductId: jest.fn(),
    deleteById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductAttributeUseCase,
        { provide: IProductAttributeRepository, useValue: mockAttributeRepo },
      ],
    }).compile();

    usecase = module.get<GetProductAttributeUseCase>(GetProductAttributeUseCase);
    attributeRepo = module.get(IProductAttributeRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait lever NotFoundException si l\'attribut n\'existe pas (sans vérifier le produit)', async () => {
      attributeRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute('product-1', 'missing-attribute')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('devrait lever BadRequestException si l\'attribut n\'appartient pas au produit', async () => {
      attributeRepo.findById.mockResolvedValue({
        id: 'attribute-1',
        productId: 'other-product',
      } as ProductAttribute);

      await expect(usecase.execute('product-1', 'attribute-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('devrait retourner l\'attribut si l\'ownership correspond', async () => {
      const attribute = { id: 'attribute-1', productId: 'product-1' } as ProductAttribute;
      attributeRepo.findById.mockResolvedValue(attribute);

      const result = await usecase.execute('product-1', 'attribute-1');

      expect(result).toEqual({ message: 'Attribute fetched successfully', attribute });
    });
  });
});
