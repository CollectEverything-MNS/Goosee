import { Injectable } from '@nestjs/common';
import { IProductRepository } from '../../repositories/product.repository';

@Injectable()
export class ListProductsUseCase {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute() {
    const products = await this.productRepo.list();

    return {
      message: 'Products fetched successfully',
      products,
    };
  }
}
