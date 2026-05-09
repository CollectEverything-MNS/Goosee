import { Injectable, NotFoundException } from '@nestjs/common';
import { IProductTagRepository } from '../../repositories/product-tag.repository';
import { IProductRepository } from '../../repositories/product.repository';
import { ITagRepository } from '../../repositories/tag.repository';
import { LogClient } from '../../services/log-client.service';

@Injectable()
export class deleteProductTagUseCase {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly tagRepo: ITagRepository,
    private readonly productTagRepo: IProductTagRepository,
    private readonly logClient: LogClient
  ) {}

  async execute(productId: string, tagId: string) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const tag = await this.tagRepo.findById(tagId);
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    const productTag = await this.productTagRepo.findOne(productId, tagId);
    if (!productTag) {
      throw new NotFoundException(`Le produit n'a pas le tag "${tag.name}"`);
    }

    await this.productTagRepo.delete(productId, tagId);

    this.logClient.success({
      message: `Tag "${tag.name}" retiré du produit "${product.name}"`,
    });

    return {
      message: 'Tag deleted from product successfully',
    };
  }
}
