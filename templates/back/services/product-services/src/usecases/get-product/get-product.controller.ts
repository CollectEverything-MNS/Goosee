import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { GetProductUseCase } from './get-product.usecase';
import { productsRoutes } from '../../config/routes.config';

@Controller(productsRoutes.root)
export class GetProductController {
  constructor(private readonly getProductUseCase: GetProductUseCase) {}

  @Get(productsRoutes.product.getOne)
  @ApiOperation({ summary: "Récupération d'un produit" })
  async getProduct(@Param('id') id: string) {
    return this.getProductUseCase.execute(id);
  }
}
