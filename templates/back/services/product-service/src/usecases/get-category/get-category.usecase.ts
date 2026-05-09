import { Injectable, NotFoundException } from '@nestjs/common';

import { ICategoryRepository } from '../../repositories/category.repository';

@Injectable()
export class GetCategoryUseCase {
  constructor(private readonly categoryRepo: ICategoryRepository) {}

  async execute(id: string) {
    const category = await this.categoryRepo.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return {
      message: 'Category fetched successfully',
      category,
    };
  }
}
