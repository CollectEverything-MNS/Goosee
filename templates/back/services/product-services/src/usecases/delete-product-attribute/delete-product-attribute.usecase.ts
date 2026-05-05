import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IProductAttributeRepository } from '../../repositories/product-attribute.repository';
import { IProductRepository } from '../../repositories/product.repository';
import { LogClient } from 'src/services/log-client.service';

@Injectable()
export class deleteProductAttributeUseCase {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly attributeRepo: IProductAttributeRepository,
    private readonly logClient: LogClient
  ) {}

  async execute(productId: string, attributeId: string) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const attribute = await this.attributeRepo.findById(attributeId);
    if (!attribute) {
      throw new NotFoundException('Attribute not found');
    }

    if (attribute.productId !== productId) {
      throw new BadRequestException("Cet attribut n'appartient pas à ce produit");
    }

    await this.attributeRepo.deleteById(attributeId);

    this.logClient.success({
      message: `Attribut "${attribute.key}" supprimé du produit "${product.name}"`,
    });

    return {
      message: 'Attribute deleted successfully',
    };
  }
}
