import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ListProductsUseCase } from './list-products.usecase';
import { productsRoutes } from '../../config/routes.config';

@Controller()
export class ListProductsController {
  constructor(private readonly listProductsUseCase: ListProductsUseCase) {}

  @Get(productsRoutes.root)
  @ApiOperation({ summary: 'Liste des produits' })
  async listProducts() {
    return this.listProductsUseCase.execute();
  }
}
