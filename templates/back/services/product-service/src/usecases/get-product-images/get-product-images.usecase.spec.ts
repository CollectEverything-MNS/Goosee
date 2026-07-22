import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetProductImagesUseCase } from './get-product-images.usecase';
import { IProductRepository } from '../../repositories/product.repository';
import { IProductImageRepository } from '../../repositories/product-image.repository';
import { Product } from '../../entities/product.entity';
import { ProductImage } from '../../entities/product-image.entity';

describe('GetProductImagesUseCase', () => {
  let usecase: GetProductImagesUseCase;
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
    clearMainByProductId: jest.fn(),
    deleteById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductImagesUseCase,
        { provide: IProductRepository, useValue: mockProductRepo },
        { provide: IProductImageRepository, useValue: mockImageRepo },
      ],
    }).compile();

    usecase = module.get<GetProductImagesUseCase>(GetProductImagesUseCase);
    productRepo = module.get(IProductRepository);
    imageRepo = module.get(IProductImageRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait lever NotFoundException si le produit n\'existe pas', async () => {
      productRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute('missing-product')).rejects.toThrow(NotFoundException);
      expect(imageRepo.listByProductId).not.toHaveBeenCalled();
    });

    it('devrait retourner les images du produit', async () => {
      productRepo.findById.mockResolvedValue({ id: 'product-1' } as Product);
      const images = [{ id: 'image-1' }] as ProductImage[];
      imageRepo.listByProductId.mockResolvedValue(images);

      const result = await usecase.execute('product-1');

      expect(result).toEqual({ message: 'Images fetched successfully', images });
    });

    it('devrait retourner une liste vide sans erreur', async () => {
      productRepo.findById.mockResolvedValue({ id: 'product-1' } as Product);
      imageRepo.listByProductId.mockResolvedValue([]);

      const result = await usecase.execute('product-1');

      expect(result).toEqual({ message: 'Images fetched successfully', images: [] });
    });
  });
});
