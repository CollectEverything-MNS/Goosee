import { Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../repositories/product.repository';
import { IProductAttributeRepository } from '../../repositories/product-attribute.repository';
import { AddProductAttributeDto } from './add-product-attribute.dto';
import { ProductAttribute } from '../../entities/product-attribute.entity';
import { LogClient } from 'src/services/log-client.service';

@Injectable()
export class AddProductAttributeUseCase {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly attributeRepo: IProductAttributeRepository,
    private readonly logClient: LogClient
  ) {}

  async execute(productId: string, dto: AddProductAttributeDto) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const attribute = new ProductAttribute();
    attribute.productId = productId;
    attribute.key = dto.key.trim();
    attribute.value = dto.value.trim();

    const saved = await this.attributeRepo.save(attribute);

    this.logClient.success({
      message: `Attribut ajouté au produit "${product.name}" : ${dto.key} = ${dto.value}`,
    });

    return {
      message: 'Attribute added successfully',
      attribute: saved,
    };
  }
}
