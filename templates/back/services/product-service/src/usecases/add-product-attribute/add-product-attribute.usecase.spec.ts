import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AddProductAttributeUseCase } from './add-product-attribute.usecase';
import { IProductRepository } from '../../repositories/product.repository';
import { IProductAttributeRepository } from '../../repositories/product-attribute.repository';
import { AddProductAttributeDto } from './add-product-attribute.dto';
import { LogClient } from '../../services/log-client.service';
import { Product } from '../../entities/product.entity';
import { ProductAttribute } from '../../entities/product-attribute.entity';

describe('AddProductAttributeUseCase', () => {
  let usecase: AddProductAttributeUseCase;
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
        AddProductAttributeUseCase,
        { provide: IProductRepository, useValue: mockProductRepo },
        { provide: IProductAttributeRepository, useValue: mockAttributeRepo },
        { provide: LogClient, useValue: mockLogClient },
      ],
    }).compile();

    usecase = module.get<AddProductAttributeUseCase>(AddProductAttributeUseCase);
    productRepo = module.get(IProductRepository);
    attributeRepo = module.get(IProductAttributeRepository);
    logClient = module.get(LogClient);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait lever NotFoundException si le produit n\'existe pas', async () => {
      productRepo.findById.mockResolvedValue(null);

      const dto: AddProductAttributeDto = { key: 'millésime', value: '2019' };

      await expect(usecase.execute('missing-product', dto)).rejects.toThrow(NotFoundException);
      expect(attributeRepo.save).not.toHaveBeenCalled();
    });

    it('devrait retirer les espaces superflus de key/value avant sauvegarde', async () => {
      productRepo.findById.mockResolvedValue({ id: 'product-1', name: 'Pizza' } as Product);
      attributeRepo.save.mockImplementation(async (a) => a as ProductAttribute);

      const dto: AddProductAttributeDto = { key: '  millésime  ', value: '  2019  ' };

      await usecase.execute('product-1', dto);

      expect(attributeRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ productId: 'product-1', key: 'millésime', value: '2019' }),
      );
    });

    it('devrait retourner l\'attribut créé avec un message de succès', async () => {
      productRepo.findById.mockResolvedValue({ id: 'product-1', name: 'Pizza' } as Product);
      const savedAttribute = { id: 'attribute-1', productId: 'product-1' } as ProductAttribute;
      attributeRepo.save.mockResolvedValue(savedAttribute);

      const result = await usecase.execute('product-1', { key: 'millésime', value: '2019' });

      expect(logClient.success).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Attribute added successfully', attribute: savedAttribute });
    });
  });
});
