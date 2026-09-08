import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DeleteProductImageUseCase } from './delete-product-image.usecase';
import { IProductImageRepository } from '../../repositories/product-image.repository';
import { StorageService } from '../../services/storage.service';
import { LogClient } from '../../services/log-client.service';
import { ProductImage } from '../../entities/product-image.entity';

describe('DeleteProductImageUseCase', () => {
  let usecase: DeleteProductImageUseCase;
  let imageRepo: jest.Mocked<IProductImageRepository>;
  let storageService: jest.Mocked<StorageService>;
  let logClient: jest.Mocked<LogClient>;

  const mockImageRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    listByProductId: jest.fn(),
    clearMainByProductId: jest.fn(),
    deleteById: jest.fn(),
  };

  const mockStorageService = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
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
        DeleteProductImageUseCase,
        { provide: IProductImageRepository, useValue: mockImageRepo },
        { provide: StorageService, useValue: mockStorageService },
        { provide: LogClient, useValue: mockLogClient },
      ],
    }).compile();

    usecase = module.get<DeleteProductImageUseCase>(DeleteProductImageUseCase);
    imageRepo = module.get(IProductImageRepository);
    storageService = module.get(StorageService);
    logClient = module.get(LogClient);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait lever NotFoundException si l\'image n\'existe pas', async () => {
      imageRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute('product-1', 'missing-image')).rejects.toThrow(
        NotFoundException,
      );
      expect(imageRepo.deleteById).not.toHaveBeenCalled();
    });

    it('devrait lever BadRequestException si l\'image n\'appartient pas au produit', async () => {
      imageRepo.findById.mockResolvedValue({
        id: 'image-1',
        productId: 'other-product',
      } as ProductImage);

      await expect(usecase.execute('product-1', 'image-1')).rejects.toThrow(BadRequestException);
      expect(imageRepo.deleteById).not.toHaveBeenCalled();
    });

    it('devrait lever BadRequestException si c\'est la dernière image du produit', async () => {
      imageRepo.findById.mockResolvedValue({
        id: 'image-1',
        productId: 'product-1',
        isMain: true,
      } as ProductImage);
      imageRepo.listByProductId.mockResolvedValue([{ id: 'image-1' }] as ProductImage[]);

      await expect(usecase.execute('product-1', 'image-1')).rejects.toThrow(BadRequestException);
      expect(storageService.deleteFile).not.toHaveBeenCalled();
      expect(imageRepo.deleteById).not.toHaveBeenCalled();
    });

    it('devrait continuer la suppression même si le storage échoue (non bloquant)', async () => {
      imageRepo.findById.mockResolvedValue({
        id: 'image-1',
        productId: 'product-1',
        url: 'http://minio/products/a.png',
        isMain: false,
      } as ProductImage);
      imageRepo.listByProductId
        .mockResolvedValueOnce([{ id: 'image-1' }, { id: 'image-2' }] as ProductImage[]);
      storageService.deleteFile.mockRejectedValue(new Error('minio down'));

      const result = await usecase.execute('product-1', 'image-1');

      expect(logClient.warning).toHaveBeenCalled();
      expect(imageRepo.deleteById).toHaveBeenCalledWith('image-1');
      expect(result).toEqual({ message: 'Image deleted successfully' });
    });

    it('devrait promouvoir une autre image en main si l\'image supprimée était main', async () => {
      imageRepo.findById.mockResolvedValue({
        id: 'image-1',
        productId: 'product-1',
        url: 'http://minio/products/a.png',
        isMain: true,
      } as ProductImage);
      imageRepo.listByProductId
        .mockResolvedValueOnce([{ id: 'image-1' }, { id: 'image-2' }] as ProductImage[])
        .mockResolvedValueOnce([{ id: 'image-2', isMain: false }] as ProductImage[]);
      storageService.deleteFile.mockResolvedValue(undefined);
      imageRepo.save.mockImplementation(async (img) => img as ProductImage);

      await usecase.execute('product-1', 'image-1');

      expect(imageRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'image-2', isMain: true }),
      );
    });

    it('ne devrait pas promouvoir d\'image si l\'image supprimée n\'était pas main', async () => {
      imageRepo.findById.mockResolvedValue({
        id: 'image-1',
        productId: 'product-1',
        url: 'http://minio/products/a.png',
        isMain: false,
      } as ProductImage);
      imageRepo.listByProductId.mockResolvedValueOnce([
        { id: 'image-1' },
        { id: 'image-2' },
      ] as ProductImage[]);
      storageService.deleteFile.mockResolvedValue(undefined);

      await usecase.execute('product-1', 'image-1');

      expect(imageRepo.save).not.toHaveBeenCalled();
    });
  });
});
