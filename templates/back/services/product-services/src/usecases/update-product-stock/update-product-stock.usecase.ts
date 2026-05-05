import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../repositories/product.repository';
import { UpdateProductStockDto } from './update-product-stock.dto';
import { LogClient } from '../../services/log-client.service';

@Injectable()
export class UpdateProductStockUseCase {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly logClient: LogClient
  ) {}

  async execute(id: string, dto: UpdateProductStockDto) {
    const product = await this.productRepo.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const newStock = product.stock + dto.quantity;

    if (newStock < 0) {
      this.logClient.warning({
        message: `Stock insuffisant pour "${product.name}" — stock actuel: ${product.stock}, quantité demandée: ${dto.quantity}`,
      });
      throw new BadRequestException(`Stock insuffisant. Stock actuel : ${product.stock}`);
    }

    product.stock = newStock;

    if (product.stock === 0) {
      product.isAvailable = false;
      this.logClient.warning({
        message: `Stock épuisé pour "${product.name}" — produit désactivé automatiquement`,
      });
    }

    const saved = await this.productRepo.save(product);

    this.logClient.success({
      message: `Stock mis à jour pour "${saved.name}" : ${saved.stock} unité(s)`,
    });

    return {
      message: 'Stock updated successfully',
      product: {
        id: saved.id,
        name: saved.name,
        stock: saved.stock,
        isAvailable: saved.isAvailable,
      },
    };
  }
}
