import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IProductImageRepository } from '../product-image.repository';
import { ProductImage } from '../../entities/product-image.entity';

@Injectable()
export class TypeOrmProductImageRepository implements IProductImageRepository {
  constructor(
    @InjectRepository(ProductImage)
    private readonly repository: Repository<ProductImage>
  ) {}

  async save(image: ProductImage): Promise<ProductImage> {
    return this.repository.save(image);
  }

  async findById(id: string): Promise<ProductImage | null> {
    return this.repository.findOne({ where: { id } });
  }

  async listByProductId(productId: string): Promise<ProductImage[]> {
    return this.repository.find({
      where: { productId },
      order: { order: 'ASC' },
    });
  }

  async clearMainByProductId(productId: string): Promise<void> {
    await this.repository.update({ productId }, { isMain: false });
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}