import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateStockUseCase } from './create-stock.usecase';

interface ProductCreatedPayload {
  productId: string;
  initialStock?: number;
}

@Controller()
export class CreateStockEventsListener {
  private readonly logger = new Logger(CreateStockEventsListener.name);

  constructor(private readonly useCase: CreateStockUseCase) {}

  @EventPattern('product.created')
  async handle(@Payload() data: ProductCreatedPayload) {
    await this.useCase.execute(data.productId, data.initialStock ?? 0);
    this.logger.log(`Stock initialisé pour le produit ${data.productId}`);
  }
}
