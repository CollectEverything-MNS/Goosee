import { Body, Controller, Param, Patch } from '@nestjs/common';
import { UpdateOrderStatusDto } from './update-order-status.dto';
import { UpdateOrderStatusUseCase } from './update-order-status.usecase';

@Controller('orders')
export class UpdateOrderStatusController {
  constructor(private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase) {}

  @Patch(':id/status')
  async update(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.updateOrderStatusUseCase.execute(id, dto);
  }
}
