import { Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../repositories/product.repository';
import { LogClient } from '../../services/log-client.service';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly logClient: LogClient
  ) {}

  async execute(id: string) {
    const product = await this.productRepo.findById(id);

    if (!product) {
      this.logClient.warning({
        message: `Tentative de suppression d'un produit introuvable : ${id}`,
      });
      throw new NotFoundException('Product not found');
    }

    await this.productRepo.softDelete(id);

    this.logClient.success({
      message: `Produit supprimé : ${product.name}`,
    });

    return {
      message: 'Product deleted successfully',
    };
  }
}
