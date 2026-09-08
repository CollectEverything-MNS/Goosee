import { Test, TestingModule } from '@nestjs/testing';
import { ListProductsUseCase } from './list-products.usecase';
import { IProductRepository } from '../../repositories/product.repository';
import { IProductImageRepository } from '../../repositories/product-image.repository';
import { Product } from '../../entities/product.entity';
import { ProductImage } from '../../entities/product-image.entity';

describe('ListProductsUseCase', () => {
  let usecase: ListProductsUseCase;
  let productRepo: jest.Mocked<IProductRepository>;
  let imageRepo: jest.Mocked<IProductImageRepository>;

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
    listByProductIds: jest.fn(),
    clearMainByProductId: jest.fn(),
    deleteById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListProductsUseCase,
        { provide: IProductRepository, useValue: mockProductRepo },
        { provide: IProductImageRepository, useValue: mockImageRepo },
      ],
    }).compile();

    usecase = module.get<ListProductsUseCase>(ListProductsUseCase);
    productRepo = module.get(IProductRepository);
    imageRepo = module.get(IProductImageRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait retourner la liste des produits sans images si aucune n\'existe', async () => {
      const products = [{ id: 'product-1' }, { id: 'product-2' }] as Product[];
      productRepo.list.mockResolvedValue(products);
      imageRepo.listByProductIds.mockResolvedValue([]);

      const result = await usecase.execute();

      expect(imageRepo.listByProductIds).toHaveBeenCalledWith(['product-1', 'product-2']);
      expect(result).toEqual({
        message: 'Products fetched successfully',
        products: [
          { id: 'product-1', images: [] },
          { id: 'product-2', images: [] },
        ],
      });
    });

    it('devrait regrouper les images par produit', async () => {
      const products = [{ id: 'product-1' }, { id: 'product-2' }] as Product[];
      const images = [
        { id: 'image-1', productId: 'product-1' },
        { id: 'image-2', productId: 'product-1' },
        { id: 'image-3', productId: 'product-2' },
      ] as ProductImage[];
      productRepo.list.mockResolvedValue(products);
      imageRepo.listByProductIds.mockResolvedValue(images);

      const result = await usecase.execute();

      expect(result.products[0].images).toEqual([images[0], images[1]]);
      expect(result.products[1].images).toEqual([images[2]]);
    });

    it('devrait retourner une liste vide sans erreur', async () => {
      productRepo.list.mockResolvedValue([]);
      imageRepo.listByProductIds.mockResolvedValue([]);

      const result = await usecase.execute();

      expect(imageRepo.listByProductIds).toHaveBeenCalledWith([]);
      expect(result).toEqual({ message: 'Products fetched successfully', products: [] });
    });
  });
});
