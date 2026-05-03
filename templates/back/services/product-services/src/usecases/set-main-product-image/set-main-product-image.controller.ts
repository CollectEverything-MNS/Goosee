import { Controller, Param, Put } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { SetMainProductImageUseCase } from './set-main-product-image.usecase';
import { productImagesRoutes } from '../../config/routes.config';

@Controller(productImagesRoutes.root)
export class SetMainProductImageController {
  constructor(private readonly setMainProductImageUseCase: SetMainProductImageUseCase) {}

  @Put(productImagesRoutes.image.setMain)
  @ApiOperation({ summary: "Définir l'image principale d'un produit" })
  async setMainImage(@Param('id') productId: string, @Param('imageId') imageId: string) {
    return this.setMainProductImageUseCase.execute(productId, imageId);
  }
}
