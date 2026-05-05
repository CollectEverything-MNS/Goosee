import { Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../repositories/product.repository';
import { ITagRepository } from '../../repositories/tag.repository';

@Injectable()
export class ListProductTagsUseCase {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly tagRepo: ITagRepository
  ) {}

  async execute(productId: string) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const tags = await this.tagRepo.findByProductId(productId);

    return {
      message: 'Product tags fetched successfully',
      tags,
    };
  }
}
