import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AddProductAttributeDto } from './add-product-attribute.dto';
import { AddProductAttributeUseCase } from './add-product-attribute.usecase';
import { productAttributesRoutes } from '../../config/routes.config';

@Controller(productAttributesRoutes.root)
export class AddProductAttributeController {
  constructor(private readonly addProductAttributeUseCase: AddProductAttributeUseCase) {}

  @Post(productAttributesRoutes.attribute.add)
  @ApiOperation({ summary: "Ajout d'un attribut à un produit" })
  async addAttribute(@Param('id') productId: string, @Body() dto: AddProductAttributeDto) {
    return this.addProductAttributeUseCase.execute(productId, dto);
  }
}
