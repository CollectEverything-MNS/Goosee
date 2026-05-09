import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IProductImageRepository } from '../../repositories/product-image.repository';
import { LogClient } from '../../services/log-client.service';

@Injectable()
export class SetMainProductImageUseCase {
  constructor(
    private readonly imageRepo: IProductImageRepository,
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

    if (image.isMain) {
      return {
        message: 'Image is already the main image',
        image,
      };
    }

    await this.imageRepo.clearMainByProductId(productId);

    image.isMain = true;
    const saved = await this.imageRepo.save(image);

    this.logClient.success({
      message: `Image principale mise à jour pour le produit ${productId}`,
    });

    return {
      message: 'Main image updated successfully',
      image: saved,
    };
  }
}
