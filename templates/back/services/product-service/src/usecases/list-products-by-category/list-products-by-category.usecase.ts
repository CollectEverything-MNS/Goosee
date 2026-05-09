import { Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../repositories/product.repository';
import { ICategoryRepository } from '../../repositories/category.repository';

@Injectable()
export class ListProductsByCategoryUseCase {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly categoryRepo: ICategoryRepository
  ) {}

  async execute(categoryId: string) {
    const category = await this.categoryRepo.findById(categoryId);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const products = await this.productRepo.listByCategoryId(categoryId);

    return {
      message: 'Products fetched successfully',
      category,
      products,
    };
  }
}
