import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IProductAttributeRepository } from '../../repositories/product-attribute.repository';

@Injectable()
export class GetProductAttributeUseCase {
  constructor(private readonly attributeRepo: IProductAttributeRepository) {}

  async execute(productId: string, attributeId: string) {
    const attribute = await this.attributeRepo.findById(attributeId);

    if (!attribute) {
      throw new NotFoundException('Attribute not found');
    }

    if (attribute.productId !== productId) {
      throw new BadRequestException("Cet attribut n'appartient pas à ce produit");
    }

    return {
      message: 'Attribute fetched successfully',
      attribute,
    };
  }
}
