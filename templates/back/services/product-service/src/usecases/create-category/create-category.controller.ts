import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { CreateCategoryDto } from './create-category.dto';
import { CreateCategoryUseCase } from './create-category.usecase';
import { categoriesRoutes } from '../../config/routes.config';

@Controller(categoriesRoutes.root)
export class CreateCategoryController {
  constructor(private readonly createCategoryUseCase: CreateCategoryUseCase) {}

  @Post(categoriesRoutes.category.create)
  @ApiOperation({ summary: "Création d'une catégorie" })
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.createCategoryUseCase.execute(dto);
  }
}
