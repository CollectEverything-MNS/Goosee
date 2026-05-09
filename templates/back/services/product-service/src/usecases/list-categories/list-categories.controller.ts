import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ListCategoriesUseCase } from './list-categories.usecase';
import { categoriesRoutes } from '../../config/routes.config';

@Controller()
export class ListCategoriesController {
  constructor(private readonly listCategoriesUseCase: ListCategoriesUseCase) {}

  @Get(categoriesRoutes.root)
  @ApiOperation({ summary: 'Liste des catégories' })
  async listCategories() {
    return this.listCategoriesUseCase.execute();
  }
}
