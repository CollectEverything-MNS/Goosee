import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { deleteProductAttributeUseCase } from './delete-product-attribute.usecase';
import { IProductRepository } from '../../repositories/product.repository';
import { IProductAttributeRepository } from '../../repositories/product-attribute.repository';
import { LogClient } from '../../services/log-client.service';
import { Product } from '../../entities/product.entity';
import { ProductAttribute } from '../../entities/product-attribute.entity';

describe('deleteProductAttributeUseCase', () => {
  let usecase: deleteProductAttributeUseCase;
  let productRepo: jest.Mocked<IProductRepository>;
  let attributeRepo: jest.Mocked<IProductAttributeRepository>;
  let logClient: jest.Mocked<LogClient>;

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
        deleteProductAttributeUseCase,
        { provide: IProductRepository, useValue: mockProductRepo },
        { provide: IProductAttributeRepository, useValue: mockAttributeRepo },
        { provide: LogClient, useValue: mockLogClient },
      ],
    }).compile();

    usecase = module.get<deleteProductAttributeUseCase>(deleteProductAttributeUseCase);
    productRepo = module.get(IProductRepository);
    attributeRepo = module.get(IProductAttributeRepository);
    logClient = module.get(LogClient);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait lever NotFoundException si le produit n\'existe pas', async () => {
      productRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute('missing-product', 'attribute-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(attributeRepo.findById).not.toHaveBeenCalled();
    });

    it('devrait lever NotFoundException si l\'attribut n\'existe pas', async () => {
      productRepo.findById.mockResolvedValue({ id: 'product-1', name: 'Pizza' } as Product);
      attributeRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute('product-1', 'missing-attribute')).rejects.toThrow(
        NotFoundException,
      );
      expect(attributeRepo.deleteById).not.toHaveBeenCalled();
    });

    it('devrait lever BadRequestException si l\'attribut n\'appartient pas au produit', async () => {
      productRepo.findById.mockResolvedValue({ id: 'product-1', name: 'Pizza' } as Product);
      attributeRepo.findById.mockResolvedValue({
        id: 'attribute-1',
        productId: 'other-product',
      } as ProductAttribute);

      await expect(usecase.execute('product-1', 'attribute-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(attributeRepo.deleteById).not.toHaveBeenCalled();
    });

    it('devrait supprimer l\'attribut si tout correspond', async () => {
      productRepo.findById.mockResolvedValue({ id: 'product-1', name: 'Pizza' } as Product);
      attributeRepo.findById.mockResolvedValue({
        id: 'attribute-1',
        productId: 'product-1',
        key: 'millésime',
      } as ProductAttribute);

      const result = await usecase.execute('product-1', 'attribute-1');

      expect(attributeRepo.deleteById).toHaveBeenCalledWith('attribute-1');
      expect(logClient.success).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Attribute deleted successfully' });
    });
  });
});
