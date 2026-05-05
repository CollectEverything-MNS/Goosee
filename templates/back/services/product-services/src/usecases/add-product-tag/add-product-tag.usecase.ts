import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../repositories/product.repository';
import { ITagRepository } from '../../repositories/tag.repository';
import { IProductTagRepository } from '../../repositories/product-tag.repository';
import { AddProductTagDto } from './add-product-tag.dto';
import { ProductTag } from '../../entities/product-tag.entity';
import { LogClient } from 'src/services/log-client.service';

@Injectable()
export class AddProductTagUseCase {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly tagRepo: ITagRepository,
    private readonly productTagRepo: IProductTagRepository,
    private readonly logClient: LogClient
  ) {}

  async execute(productId: string, dto: AddProductTagDto) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const tag = await this.tagRepo.findById(dto.tagId);
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    const existing = await this.productTagRepo.findOne(productId, dto.tagId);
    if (existing) {
      throw new BadRequestException(`Le produit a déjà le tag "${tag.name}"`);
    }

    const productTag = new ProductTag();
    productTag.productId = productId;
    productTag.tagId = dto.tagId;

    await this.productTagRepo.save(productTag);

    this.logClient.success({
      message: `Tag "${tag.name}" ajouté au produit "${product.name}"`,
    });

    return {
      message: 'Tag added to product successfully',
      tag,
    };
  }
}
