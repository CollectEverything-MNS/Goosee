import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { GetCategoryUseCase } from './get-category.usecase';
import { categoriesRoutes } from '../../config/routes.config';

@Controller(categoriesRoutes.root)
export class GetCategoryController {
  constructor(private readonly getCategoryUseCase: GetCategoryUseCase) {}

  @Get(categoriesRoutes.category.getOne)
  @ApiOperation({ summary: "Récupération d'une catégorie" })
  async getCategory(@Param('id') id: string) {
    return this.getCategoryUseCase.execute(id);
  }
}
