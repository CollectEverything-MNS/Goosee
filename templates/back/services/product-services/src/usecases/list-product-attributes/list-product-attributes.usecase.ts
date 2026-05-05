import { Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../repositories/product.repository';
import { IProductAttributeRepository } from '../../repositories/product-attribute.repository';

@Injectable()
export class ListProductAttributesUseCase {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly attributeRepo: IProductAttributeRepository
  ) {}

  async execute(productId: string) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const attributes = await this.attributeRepo.listByProductId(productId);

    return {
      message: 'Product attributes fetched successfully',
      attributes,
    };
  }
}
