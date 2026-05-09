import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AddProductTagDto } from './add-product-tag.dto';
import { AddProductTagUseCase } from './add-product-tag.usecase';
import { productTagsRoutes } from '../../config/routes.config';

@Controller(productTagsRoutes.root)
export class AddProductTagController {
  constructor(private readonly addProductTagUseCase: AddProductTagUseCase) {}

  @Post(productTagsRoutes.productTag.add)
  @ApiOperation({ summary: "Ajout d'un tag à un produit" })
  async addTag(@Param('id') productId: string, @Body() dto: AddProductTagDto) {
    return this.addProductTagUseCase.execute(productId, dto);
  }
}
