import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { CreateProductUseCase } from './create-product.usecase';
import { productsRoutes } from '../../config/routes.config';

@Controller(productsRoutes.root)
export class CreateProductController {
  constructor(private readonly createProductUseCase: CreateProductUseCase) {}

  @Post(productsRoutes.product.create)
  @ApiOperation({ summary: "Création d'un produit" })
  async createProduct(@Body() dto: CreateProductDto) {
    return this.createProductUseCase.execute(dto);
  }
}
