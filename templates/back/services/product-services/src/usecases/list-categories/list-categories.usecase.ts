import { Injectable } from '@nestjs/common';

import { ICategoryRepository } from '../../repositories/category.repository';

@Injectable()
export class ListCategoriesUseCase {
  constructor(private readonly categoryRepo: ICategoryRepository) {}

  async execute() {
    const categories = await this.categoryRepo.list();

    return {
      message: 'Categories fetched successfully',
      categories,
    };
  }
}
