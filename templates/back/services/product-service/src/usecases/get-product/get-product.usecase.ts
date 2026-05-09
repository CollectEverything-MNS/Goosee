import { Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../repositories/product.repository';
import { IProductImageRepository } from '../../repositories/product-image.repository';
import { ITagRepository } from '../../repositories/tag.repository';
import { IProductAttributeRepository } from '../../repositories/product-attribute.repository';

@Injectable()
export class GetProductUseCase {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly imageRepo: IProductImageRepository,
    private readonly tagRepo: ITagRepository,
    private readonly attributeRepo: IProductAttributeRepository
  ) {}

  async execute(id: string) {
    const product = await this.productRepo.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const [images, tags, attributes] = await Promise.all([
      this.imageRepo.listByProductId(id),
      this.tagRepo.findByProductId(id),
      this.attributeRepo.listByProductId(id),
    ]);

    return {
      message: 'Product fetched successfully',
      product: {
        ...product,
        images,
        tags,
        attributes,
      },
    };
  }
}
