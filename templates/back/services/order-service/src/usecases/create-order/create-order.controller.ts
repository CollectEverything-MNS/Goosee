import { Body, Controller, Post } from '@nestjs/common';
import { CreateOrderDto } from './create-order.dto';
import { CreateOrderUseCase } from './create-order.usecase';

@Controller('orders')
export class CreateOrderController {
  constructor(private readonly createOrderUseCase: CreateOrderUseCase) {}

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    return this.createOrderUseCase.execute(dto);
  }
}
