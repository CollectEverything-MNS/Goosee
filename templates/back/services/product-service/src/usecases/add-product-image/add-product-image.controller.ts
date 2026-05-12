import { Controller, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { AddProductImageUseCase } from './add-product-image.usecase';
import { productImagesRoutes } from '../../config/routes.config';

@Controller(productImagesRoutes.root)
export class AddProductImageController {
  constructor(private readonly addProductImageUseCase: AddProductImageUseCase) {}

  @Post(productImagesRoutes.image.add)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: "Ajout d'une image à un produit" })
  async addImage(
    @Param('id') productId: string,
    @UploadedFile() file: any,
    @Query('isMain') isMain?: string
  ) {
    return this.addProductImageUseCase.execute(productId, file, isMain === 'true');
  }
}
