import { Module } from '@nestjs/common';
import { SharedSecurityModule } from '../../shared/shared-security.module';
import { CreateCategoryController } from './usecases/create-category/create-category.controller';
import { DeleteCategoryController } from './usecases/delete-category/delete-category.controller';
import { GetCategoryController } from './usecases/get-category/get-category.controller';
import { ListCategoriesController } from './usecases/list-categories/list-categories.controller';
import { ListProductsByCategoryController } from './usecases/list-products-by-category/list-products-by-category.controller';
import { UpdateCategoryController } from './usecases/update-category/update-category.controller';


@Module({
  imports: [SharedSecurityModule],
  controllers: [
    ListCategoriesController,
    GetCategoryController,
    CreateCategoryController,
    UpdateCategoryController,
    DeleteCategoryController,
    ListProductsByCategoryController,
  ],
})
export class CategoriesModule {}