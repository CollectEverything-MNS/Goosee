import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { InternalTokenGuard } from '../shared/internal-token.guard';

@Controller('internal/kpi')
@UseGuards(InternalTokenGuard)
export class InternalKpiController {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
  ) {}

  @Get()
  async kpi() {
    const [products, categories] = await Promise.all([
      this.products.count(),
      this.categories.count(),
    ]);
    return { products, categories };
  }
}
