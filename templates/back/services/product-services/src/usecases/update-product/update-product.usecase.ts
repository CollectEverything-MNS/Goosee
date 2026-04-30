import { Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../repositories/product.repository';
import { ICategoryRepository } from '../../repositories/category.repository';
import { UpdateProductDto } from './update-product.dto';
import { LogClient } from '../../shared/log-client.service';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly categoryRepo: ICategoryRepository,
    private readonly logClient: LogClient
  ) {}

  async execute(id: string, dto: UpdateProductDto) {
    const product = await this.productRepo.findById(id);

    if (!product) {
      this.logClient.warning({
        message: `Tentative de mise à jour d'un produit introuvable : ${id}`,
      });
      throw new NotFoundException('Product not found');
    }

    if (dto.categoryId && dto.categoryId !== product.categoryId) {
      const category = await this.categoryRepo.findById(dto.categoryId);
      if (!category) {
        throw new NotFoundException(`Category not found : ${dto.categoryId}`);
      }
    }

    const newStock = dto.stock ?? product.stock;

    let newIsAvailable = dto.isAvailable ?? product.isAvailable;
    if (newStock === 0) {
      newIsAvailable = false;
    }

    const updated = {
      ...product,
      name: dto.name ?? product.name,
      description: dto.description ?? product.description,
      price: dto.price ?? product.price,
      stock: newStock,
      preparationTime: dto.preparationTime ?? product.preparationTime,
      sizeValue: dto.sizeValue ?? product.sizeValue,
      sizeUnit: dto.sizeUnit ?? product.sizeUnit,
      isAvailable: newIsAvailable,
      categoryId: dto.categoryId ?? product.categoryId,
    };

    const saved = await this.productRepo.save(updated);

    this.logClient.success({
      message: `Produit mis à jour : ${saved.name}`,
    });

    return {
      message: 'Product updated successfully',
      product: saved,
    };
  }
}
