import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { ICategoryRepository } from '../../repositories/category.repository';
import { IProductRepository } from '../../repositories/product.repository';
import { LogClient } from '../../shared/log-client.service';

@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    private readonly categoryRepo: ICategoryRepository,
    private readonly productRepo: IProductRepository,
    private readonly logClient: LogClient
  ) {}

  async execute(id: string) {
    const category = await this.categoryRepo.findById(id);

    if (!category) {
      this.logClient.warning({
        message: `Tentative de suppression d'une catégorie introuvable : ${id}`,
      });
      throw new NotFoundException('Category not found');
    }

    const productCount = await this.productRepo.countByCategoryId(id);
    if (productCount > 0) {
      this.logClient.warning({
        message: `Tentative de suppression de la catégorie "${category.name}" avec ${productCount} produit(s) rattaché(s)`,
      });
      throw new BadRequestException(
        `Cannot delete category with products. Move or delete the ${productCount} product(s) first.`
      );
    }

    await this.categoryRepo.softDelete(id);

    this.logClient.success({
      message: `Catégorie supprimée : ${category.name}`,
    });

    return {
      message: 'Category deleted successfully',
    };
  }
}
