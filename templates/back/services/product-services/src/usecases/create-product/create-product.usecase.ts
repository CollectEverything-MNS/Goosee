import { Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../repositories/product.repository';
import { ICategoryRepository } from '../../repositories/category.repository';
import { CreateProductDto } from './create-product.dto';
import { Product } from '../../entities/product.entity';
import { LogClient } from '../../services/log-client.service';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly categoryRepo: ICategoryRepository,
    private readonly logClient: LogClient
  ) {}

  async execute(dto: CreateProductDto) {
    const category = await this.categoryRepo.findById(dto.categoryId);
    if (!category) {
      this.logClient.warning({
        message: `Tentative de création d'un produit avec une catégorie inexistante : ${dto.categoryId}`,
      });
      throw new NotFoundException(`Category not found : ${dto.categoryId}`);
    }

    const product = new Product({
      name: dto.name,
      description: dto.description ?? null,
      price: dto.price,
      stock: dto.stock,
      preparationTime: dto.preparationTime ?? 0,
      sizeValue: dto.sizeValue ?? null,
      sizeUnit: dto.sizeUnit ?? null,
      isAvailable: dto.stock === 0 ? false : (dto.isAvailable ?? true),
      categoryId: dto.categoryId,
    });

    const saved = await this.productRepo.save(product);

    this.logClient.success({
      message: `Produit créé : ${saved.name}`,
    });

    return {
      message: 'Product created successfully',
      product: saved,
    };
  }
}
