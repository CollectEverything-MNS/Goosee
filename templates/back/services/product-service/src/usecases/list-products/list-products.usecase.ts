import { Injectable } from '@nestjs/common';
import { IProductRepository } from '../../repositories/product.repository';
import { IProductImageRepository } from '../../repositories/product-image.repository';
import { ProductImage } from '../../entities/product-image.entity';

@Injectable()
export class ListProductsUseCase {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly imageRepo: IProductImageRepository,
  ) {}

  async execute() {
    const products = await this.productRepo.list();

    const images = await this.imageRepo.listByProductIds(
      products.map((product) => product.id),
    );

    const imagesByProduct = new Map<string, ProductImage[]>();
    for (const image of images) {
      const current = imagesByProduct.get(image.productId) ?? [];
      current.push(image);
      imagesByProduct.set(image.productId, current);
    }

    return {
      message: 'Products fetched successfully',
      products: products.map((product) => ({
        ...product,
        images: imagesByProduct.get(product.id) ?? [],
      })),
    };
  }
}
