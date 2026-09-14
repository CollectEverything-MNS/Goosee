import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SetMainProductImageUseCase } from './set-main-product-image.usecase';
import { IProductImageRepository } from '../../repositories/product-image.repository';
import { LogClient } from '../../services/log-client.service';
import { ProductImage } from '../../entities/product-image.entity';

describe('SetMainProductImageUseCase', () => {
  let usecase: SetMainProductImageUseCase;
  let imageRepo: jest.Mocked<IProductImageRepository>;
  let logClient: jest.Mocked<LogClient>;

  const mockImageRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    listByProductId: jest.fn(),
    clearMainByProductId: jest.fn(),
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
        SetMainProductImageUseCase,
        { provide: IProductImageRepository, useValue: mockImageRepo },
        { provide: LogClient, useValue: mockLogClient },
      ],
    }).compile();

    usecase = module.get<SetMainProductImageUseCase>(SetMainProductImageUseCase);
    imageRepo = module.get(IProductImageRepository);
    logClient = module.get(LogClient);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('devrait lever NotFoundException si l\'image n\'existe pas', async () => {
      imageRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute('product-1', 'missing-image')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('devrait lever BadRequestException si l\'image n\'appartient pas au produit', async () => {
      imageRepo.findById.mockResolvedValue({
        id: 'image-1',
        productId: 'other-product',
      } as ProductImage);

      await expect(usecase.execute('product-1', 'image-1')).rejects.toThrow(BadRequestException);
    });

    it('devrait court-circuiter sans effet de bord si l\'image est déjà main', async () => {
      const image = { id: 'image-1', productId: 'product-1', isMain: true } as ProductImage;
      imageRepo.findById.mockResolvedValue(image);

      const result = await usecase.execute('product-1', 'image-1');

      expect(imageRepo.clearMainByProductId).not.toHaveBeenCalled();
      expect(imageRepo.save).not.toHaveBeenCalled();
      expect(logClient.success).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'Image is already the main image', image });
    });

    it('devrait clear les autres mains puis définir cette image comme main', async () => {
      const image = { id: 'image-1', productId: 'product-1', isMain: false } as ProductImage;
      imageRepo.findById.mockResolvedValue(image);
      imageRepo.save.mockImplementation(async (img) => img as ProductImage);

      const result = await usecase.execute('product-1', 'image-1');

      expect(imageRepo.clearMainByProductId).toHaveBeenCalledWith('product-1');
      expect(imageRepo.save).toHaveBeenCalledWith(expect.objectContaining({ isMain: true }));
      expect(logClient.success).toHaveBeenCalled();
      expect(result.message).toBe('Main image updated successfully');
    });
  });
});
