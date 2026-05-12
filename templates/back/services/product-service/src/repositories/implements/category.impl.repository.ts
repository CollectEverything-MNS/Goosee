import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '../../entities/category.entity';
import { ICategoryRepository } from '../category.repository';

@Injectable()
export class TypeOrmCategoryRepository implements ICategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>
  ) {}

  async save(category: Category): Promise<Category> {
    return this.repository.save(category);
  }

  async findById(id: string): Promise<Category | null> {
    return this.repository.findOne({ where: { id } });
  }

  async list(): Promise<Category[]> {
    return this.repository.find({
      order: { order: 'ASC', name: 'ASC' },
    });
  }

  async listByParentId(parentId: string): Promise<Category[]> {
    return this.repository.find({
      where: { parentId },
      order: { order: 'ASC' },
    });
  }

  async hasProducts(categoryId: string): Promise<boolean> {
    return false;
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete({ id });
  }
}
