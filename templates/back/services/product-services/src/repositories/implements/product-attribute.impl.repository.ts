import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IProductAttributeRepository } from '../product-attribute.repository';
import { ProductAttribute } from '../../entities/product-attribute.entity';

@Injectable()
export class TypeOrmProductAttributeRepository implements IProductAttributeRepository {
  constructor(
    @InjectRepository(ProductAttribute)
    private readonly repository: Repository<ProductAttribute>
  ) {}

  async save(attribute: ProductAttribute): Promise<ProductAttribute> {
    return this.repository.save(attribute);
  }

  async findById(id: string): Promise<ProductAttribute | null> {
    return this.repository.findOne({ where: { id } });
  }

  async listByProductId(productId: string): Promise<ProductAttribute[]> {
    return this.repository.find({ where: { productId } });
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}