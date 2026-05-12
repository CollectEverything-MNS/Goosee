import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../repositories/product.repository';
import { IProductImageRepository } from '../../repositories/product-image.repository';
import { StorageService } from '../../services/storage.service';
import { ProductImage } from '../../entities/product-image.entity';
import { LogClient } from '../../services/log-client.service';

@Injectable()
export class AddProductImageUseCase {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly imageRepo: IProductImageRepository,
    private readonly storageService: StorageService,
    private readonly logClient: LogClient
  ) {}

  async execute(productId: string, file: any, isMain: boolean = false) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Le fichier doit être une image');
    }

    const { url, key } = await this.storageService.uploadFile(file, 'products');

    const existingImages = await this.imageRepo.listByProductId(productId);
    const nextOrder = existingImages.length;

    if (isMain) {
      await this.imageRepo.clearMainByProductId(productId);
    }

    const shouldBeMain = isMain || existingImages.length === 0;

    const image = new ProductImage({
      productId,
      url,
      isMain: shouldBeMain,
      order: nextOrder,
    });

    const saved = await this.imageRepo.save(image);

    this.logClient.success({
      message: `Image ajoutée au produit "${product.name}" : ${url}`,
    });

    return {
      message: 'Image added successfully',
      image: saved,
      storageKey: key,
    };
  }
}
