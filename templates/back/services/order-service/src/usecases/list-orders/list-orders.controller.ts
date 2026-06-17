import { Controller, Get, Query } from '@nestjs/common';
import { ListOrdersUseCase } from './list-orders.usecase';

@Controller('orders')
export class ListOrdersController {
  constructor(private readonly listOrdersUseCase: ListOrdersUseCase) {}

  @Get()
  async list(@Query('customerId') customerId?: string) {
    return this.listOrdersUseCase.execute(customerId);
  }
}
