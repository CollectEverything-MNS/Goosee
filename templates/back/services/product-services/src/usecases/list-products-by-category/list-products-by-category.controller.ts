import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ListProductsByCategoryUseCase } from './list-products-by-category.usecase';
import { categoriesRoutes } from '../../config/routes.config';

@Controller(categoriesRoutes.root)
export class ListProductsByCategoryController {
  constructor(private readonly listProductsByCategoryUseCase: ListProductsByCategoryUseCase) {}

  @Get(categoriesRoutes.category.products)
  @ApiOperation({ summary: "Liste des produits d'une catégorie" })
  async listProductsByCategory(@Param('id') categoryId: string) {
    return this.listProductsByCategoryUseCase.execute(categoryId);
  }
}
