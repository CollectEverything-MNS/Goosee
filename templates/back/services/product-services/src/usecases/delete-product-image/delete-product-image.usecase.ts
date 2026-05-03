import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IProductImageRepository } from '../../repositories/product-image.repository';
import { StorageService } from '../../services/storage.service';
import { LogClient } from '../../shared/log-client.service';

@Injectable()
export class DeleteProductImageUseCase {
  constructor(
    private readonly imageRepo: IProductImageRepository,
    private readonly storageService: StorageService,
    private readonly logClient: LogClient
  ) {}

  async execute(productId: string, imageId: string) {
    const image = await this.imageRepo.findById(imageId);

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    if (image.productId !== productId) {
      throw new BadRequestException("Cette image n'appartient pas à ce produit");
    }

    const images = await this.imageRepo.listByProductId(productId);
    if (images.length === 1) {
      throw new BadRequestException('Impossible de supprimer la seule image du produit');
    }

    try {
      const urlParts = image.url.split('/');
      const objectKey = urlParts.slice(-2).join('/');
      await this.storageService.deleteFile(objectKey);
    } catch {
      this.logClient.warning({
        message: `Impossible de supprimer le fichier MinIO pour l'image ${imageId}`,
      });
    }

    await this.imageRepo.deleteById(imageId);

    if (image.isMain) {
      const remaining = await this.imageRepo.listByProductId(productId);
      if (remaining.length > 0) {
        remaining[0].isMain = true;
        await this.imageRepo.save(remaining[0]);
      }
    }

    this.logClient.success({
      message: `Image supprimée du produit ${productId}`,
    });

    return {
      message: 'Image deleted successfully',
    };
  }
}
