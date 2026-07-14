import { Test, TestingModule } from '@nestjs/testing';
import { ListProductsUseCase } from './list-products.usecase';
import { IProductRepository } from '../../repositories/product.repository';
import { Product } from '../../entities/product.entity';

describe('ListProductsUseCase', () => {
  let usecase: ListProductsUseCase;
  let productRepo: jest.Mocked<IProductRepository>;

  const mockProductRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    listByCategoryId: jest.fn(),
    countByCategoryId: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListProductsUseCase, { provide: IProductRepository, useValue: mockProductRepo }],
    }).compile();

    usecase = module.get<ListProductsUseCase>(ListProductsUseCase);
    productRepo = module.get(IProductRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait retourner la liste des produits', async () => {
      const products = [{ id: 'product-1' }, { id: 'product-2' }] as Product[];
      productRepo.list.mockResolvedValue(products);

      const result = await usecase.execute();

      expect(productRepo.list).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Products fetched successfully', products });
    });

    it('devrait retourner une liste vide sans erreur', async () => {
      productRepo.list.mockResolvedValue([]);

      const result = await usecase.execute();

      expect(result).toEqual({ message: 'Products fetched successfully', products: [] });
    });
  });
});
