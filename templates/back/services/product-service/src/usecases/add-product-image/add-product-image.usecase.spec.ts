import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AddProductImageUseCase } from './add-product-image.usecase';
import { IProductRepository } from '../../repositories/product.repository';
import { IProductImageRepository } from '../../repositories/product-image.repository';
import { StorageService } from '../../services/storage.service';
import { LogClient } from '../../services/log-client.service';
import { Product } from '../../entities/product.entity';
import { ProductImage } from '../../entities/product-image.entity';

describe('AddProductImageUseCase', () => {
  let usecase: AddProductImageUseCase;
  let productRepo: jest.Mocked<IProductRepository>;
  let imageRepo: jest.Mocked<IProductImageRepository>;
  let storageService: jest.Mocked<StorageService>;
  let logClient: jest.Mocked<LogClient>;

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

  const imageFile = { mimetype: 'image/png', originalname: 'photo.png', buffer: Buffer.from(''), size: 10 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddProductImageUseCase,
        { provide: IProductRepository, useValue: mockProductRepo },
        { provide: IProductImageRepository, useValue: mockImageRepo },
        { provide: StorageService, useValue: mockStorageService },
        { provide: LogClient, useValue: mockLogClient },
      ],
    }).compile();

    usecase = module.get<AddProductImageUseCase>(AddProductImageUseCase);
    productRepo = module.get(IProductRepository);
    imageRepo = module.get(IProductImageRepository);
    storageService = module.get(StorageService);
    logClient = module.get(LogClient);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait lever NotFoundException si le produit n\'existe pas', async () => {
      productRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute('missing-product', imageFile, false)).rejects.toThrow(
        NotFoundException,
      );
      expect(storageService.uploadFile).not.toHaveBeenCalled();
    });

    it('devrait lever BadRequestException si le fichier n\'est pas une image', async () => {
      productRepo.findById.mockResolvedValue({ id: 'product-1', name: 'Pizza' } as Product);

      const nonImageFile = { ...imageFile, mimetype: 'application/pdf' };

      await expect(usecase.execute('product-1', nonImageFile, false)).rejects.toThrow(
        BadRequestException,
      );
      expect(storageService.uploadFile).not.toHaveBeenCalled();
    });

    it('devrait utiliser isMain=false par défaut quand le paramètre est omis', async () => {
      productRepo.findById.mockResolvedValue({ id: 'product-1', name: 'Pizza' } as Product);
      imageRepo.listByProductId.mockResolvedValue([{ id: 'image-1' }] as ProductImage[]);
      storageService.uploadFile.mockResolvedValue({ url: 'http://minio/products/z.png', key: 'products/z.png' });
      imageRepo.save.mockImplementation(async (img) => img as ProductImage);

      await usecase.execute('product-1', imageFile);

      expect(imageRepo.clearMainByProductId).not.toHaveBeenCalled();
      expect(imageRepo.save).toHaveBeenCalledWith(expect.objectContaining({ isMain: false }));
    });

    it('devrait forcer isMain=true pour la toute première image du produit, même si isMain=false est demandé', async () => {
      productRepo.findById.mockResolvedValue({ id: 'product-1', name: 'Pizza' } as Product);
      imageRepo.listByProductId.mockResolvedValue([]);
      storageService.uploadFile.mockResolvedValue({ url: 'http://minio/products/a.png', key: 'products/a.png' });
      imageRepo.save.mockImplementation(async (img) => img as ProductImage);

      await usecase.execute('product-1', imageFile, false);

      expect(imageRepo.clearMainByProductId).not.toHaveBeenCalled();
      expect(imageRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isMain: true, order: 0 }),
      );
    });

    it('devrait respecter isMain=false quand des images existent déjà', async () => {
      productRepo.findById.mockResolvedValue({ id: 'product-1', name: 'Pizza' } as Product);
      imageRepo.listByProductId.mockResolvedValue([{ id: 'image-1' }] as ProductImage[]);
      storageService.uploadFile.mockResolvedValue({ url: 'http://minio/products/b.png', key: 'products/b.png' });
      imageRepo.save.mockImplementation(async (img) => img as ProductImage);

      await usecase.execute('product-1', imageFile, false);

      expect(imageRepo.clearMainByProductId).not.toHaveBeenCalled();
      expect(imageRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ isMain: false, order: 1 }),
      );
    });

    it('devrait clear les autres mains puis sauvegarder isMain=true quand isMain=true est demandé avec des images existantes', async () => {
      productRepo.findById.mockResolvedValue({ id: 'product-1', name: 'Pizza' } as Product);
      imageRepo.listByProductId.mockResolvedValue([{ id: 'image-1' }] as ProductImage[]);
      storageService.uploadFile.mockResolvedValue({ url: 'http://minio/products/c.png', key: 'products/c.png' });
      imageRepo.save.mockImplementation(async (img) => img as ProductImage);

      await usecase.execute('product-1', imageFile, true);

      expect(imageRepo.clearMainByProductId).toHaveBeenCalledWith('product-1');
      expect(imageRepo.save).toHaveBeenCalledWith(expect.objectContaining({ isMain: true }));
    });

    it('devrait retourner la clé de stockage et l\'image créée', async () => {
      productRepo.findById.mockResolvedValue({ id: 'product-1', name: 'Pizza' } as Product);
      imageRepo.listByProductId.mockResolvedValue([]);
      storageService.uploadFile.mockResolvedValue({ url: 'http://minio/products/d.png', key: 'products/d.png' });
      const savedImage = { id: 'image-1', url: 'http://minio/products/d.png' } as ProductImage;
      imageRepo.save.mockResolvedValue(savedImage);

      const result = await usecase.execute('product-1', imageFile, false);

      expect(logClient.success).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Image added successfully',
        image: savedImage,
        storageKey: 'products/d.png',
      });
    });
  });
});
