import { Controller, Get, Param } from '@nestjs/common';
import { GetOrderUseCase } from './get-order.usecase';

@Controller('orders')
export class GetOrderController {
  constructor(private readonly getOrderUseCase: GetOrderUseCase) {}

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.getOrderUseCase.execute(id);
  }
}
