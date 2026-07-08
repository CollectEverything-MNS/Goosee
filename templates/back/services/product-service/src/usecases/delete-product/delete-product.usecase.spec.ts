import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteProductUseCase } from './delete-product.usecase';
import { IProductRepository } from '../../repositories/product.repository';
import { LogClient } from '../../services/log-client.service';
import { Product } from '../../entities/product.entity';

describe('DeleteProductUseCase', () => {
  let usecase: DeleteProductUseCase;
  let productRepo: jest.Mocked<IProductRepository>;
  let logClient: jest.Mocked<LogClient>;

  const mockProductRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    listByCategoryId: jest.fn(),
    countByCategoryId: jest.fn(),
    softDelete: jest.fn(),
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
        DeleteProductUseCase,
        { provide: IProductRepository, useValue: mockProductRepo },
        { provide: LogClient, useValue: mockLogClient },
      ],
    }).compile();

    usecase = module.get<DeleteProductUseCase>(DeleteProductUseCase);
    productRepo = module.get(IProductRepository);
    logClient = module.get(LogClient);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait lever NotFoundException si le produit n\'existe pas', async () => {
      productRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute('missing-id')).rejects.toThrow(NotFoundException);
      await expect(usecase.execute('missing-id')).rejects.toThrow('Product not found');
      expect(logClient.warning).toHaveBeenCalled();
      expect(productRepo.softDelete).not.toHaveBeenCalled();
    });

    it('devrait supprimer (soft delete) le produit et retourner un message', async () => {
      productRepo.findById.mockResolvedValue({ id: 'product-1', name: 'Pizza' } as Product);

      const result = await usecase.execute('product-1');

      expect(productRepo.softDelete).toHaveBeenCalledWith('product-1');
      expect(logClient.success).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Product deleted successfully' });
    });
  });
});
