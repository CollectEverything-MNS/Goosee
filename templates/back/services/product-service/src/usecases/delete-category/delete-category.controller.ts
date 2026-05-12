import { Controller, Delete, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { DeleteCategoryUseCase } from './delete-category.usecase';
import { categoriesRoutes } from '../../config/routes.config';

@Controller(categoriesRoutes.root)
export class DeleteCategoryController {
  constructor(private readonly deleteCategoryUseCase: DeleteCategoryUseCase) {}

  @Delete(categoriesRoutes.category.delete)
  @ApiOperation({ summary: "Suppression d'une catégorie" })
  async deleteCategory(@Param('id') id: string) {
    return this.deleteCategoryUseCase.execute(id);
  }
}
