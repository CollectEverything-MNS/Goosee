import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../repositories/product.repository';
import { ICategoryRepository } from '../../repositories/category.repository';
import { CreateProductDto } from './create-product.dto';
import { Product } from '../../entities/product.entity';
import { LogClient } from '../../services/log-client.service';
import { StockClient } from '../../services/stock-client.service';

@Injectable()
export class CreateProductUseCase {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly categoryRepo: ICategoryRepository,
    private readonly logClient: LogClient,
    private readonly stockClient: StockClient
  ) {}

  async execute(dto: CreateProductDto) {
    const categoryIds = await this.resolveCategoryIds(dto.categoryIds, dto.categoryId);

    const product = new Product({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      preparationTime: dto.preparationTime ?? 0,
      sizeValue: dto.sizeValue,
      sizeUnit: dto.sizeUnit,
      isAvailable: dto.isAvailable ?? true,
      categoryId: categoryIds[0],
      categoryIds,
    });

    const saved = await this.productRepo.save(product);

    this.stockClient.productCreated(saved.id, dto.initialStock);

    this.logClient.success({
      message: `Produit créé : ${saved.name}`,
    });

    return {
      message: 'Product created successfully',
      product: saved,
    };
  }

  private async resolveCategoryIds(
    categoryIds?: string[],
    categoryId?: string,
  ): Promise<string[]> {
    const ids = Array.from(
      new Set((categoryIds?.length ? categoryIds : categoryId ? [categoryId] : []).filter(Boolean)),
    );

    if (!ids.length) {
      throw new BadRequestException('At least one category is required');
    }

    for (const id of ids) {
      const category = await this.categoryRepo.findById(id);
      if (!category) {
        this.logClient.warning({
          message: `Tentative de création d'un produit avec une catégorie inexistante : ${id}`,
        });
        throw new NotFoundException(`Category not found : ${id}`);
      }
    }

    return ids;
  }
}
