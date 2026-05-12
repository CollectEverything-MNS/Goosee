import { Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../repositories/product.repository';
import { IProductImageRepository } from '../../repositories/product-image.repository';

@Injectable()
export class GetProductImagesUseCase {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly imageRepo: IProductImageRepository
  ) {}

  async execute(productId: string) {
    const product = await this.productRepo.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const images = await this.imageRepo.listByProductId(productId);

    return {
      message: 'Images fetched successfully',
      images,
    };
  }
}
