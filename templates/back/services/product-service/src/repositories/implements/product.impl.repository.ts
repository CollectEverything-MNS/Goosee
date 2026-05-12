import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IProductRepository } from '../product.repository';
import { Product } from '../../entities/product.entity';

@Injectable()
export class TypeOrmProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>
  ) {}

  async save(product: Product): Promise<Product> {
    return this.repository.save(product);
  }

  async findById(id: string): Promise<Product | null> {
    return this.repository.findOne({ where: { id } });
  }

  async list(): Promise<Product[]> {
    return this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async listByCategoryId(categoryId: string): Promise<Product[]> {
    return this.repository.find({
      where: { categoryId },
      order: { createdAt: 'DESC' },
    });
  }

  async countByCategoryId(categoryId: string): Promise<number> {
    return this.repository.count({ where: { categoryId } });
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete({ id });
  }
}
