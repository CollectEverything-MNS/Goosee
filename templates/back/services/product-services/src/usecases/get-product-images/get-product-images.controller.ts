import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { GetProductImagesUseCase } from './get-product-images.usecase';
import { productImagesRoutes } from '../../config/routes.config';

@Controller(productImagesRoutes.root)
export class GetProductImagesController {
  constructor(private readonly getProductImagesUseCase: GetProductImagesUseCase) {}

  @Get(productImagesRoutes.image.add)
  @ApiOperation({ summary: "Liste des images d'un produit" })
  async getImages(@Param('id') productId: string) {
    return this.getProductImagesUseCase.execute(productId);
  }
}
