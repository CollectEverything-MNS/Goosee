import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IProductTagRepository } from '../product-tag.repository';
import { ProductTag } from '../../entities/product-tag.entity';

@Injectable()
export class TypeOrmProductTagRepository implements IProductTagRepository {
  constructor(
    @InjectRepository(ProductTag)
    private readonly repository: Repository<ProductTag>
  ) {}

  async save(productTag: ProductTag): Promise<ProductTag> {
    return this.repository.save(productTag);
  }

  async findByProductId(productId: string): Promise<ProductTag[]> {
    return this.repository.find({ where: { productId } });
  }

  async findOne(productId: string, tagId: string): Promise<ProductTag | null> {
    return this.repository.findOne({ where: { productId, tagId } });
  }

  async delete(productId: string, tagId: string): Promise<void> {
    await this.repository.delete({ productId, tagId });
  }
}
