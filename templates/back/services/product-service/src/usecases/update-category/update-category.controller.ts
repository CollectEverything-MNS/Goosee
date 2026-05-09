import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { UpdateCategoryDto } from './update-category.dto';
import { UpdateCategoryUseCase } from './update-category.usecase';
import { categoriesRoutes } from '../../config/routes.config';

@Controller(categoriesRoutes.root)
export class UpdateCategoryController {
  constructor(private readonly updateCategoryUseCase: UpdateCategoryUseCase) {}

  @Patch(categoriesRoutes.category.update)
  @ApiOperation({ summary: "Mise à jour d'une catégorie" })
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.updateCategoryUseCase.execute(id, dto);
  }
}
