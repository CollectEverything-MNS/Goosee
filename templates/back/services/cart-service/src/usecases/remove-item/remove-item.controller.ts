import { Controller, Delete, Param } from '@nestjs/common';
import { RemoveItemUseCase } from './remove-item.usecase';

@Controller('cart')
export class RemoveItemController {
  constructor(private readonly removeItemUseCase: RemoveItemUseCase) {}

  @Delete(':sessionKey/items/:productId')
  async remove(
    @Param('sessionKey') sessionKey: string,
    @Param('productId') productId: string
  ) {
    return this.removeItemUseCase.execute(sessionKey, productId);
  }
}
