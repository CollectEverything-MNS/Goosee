import { Controller, Delete, Param } from '@nestjs/common';
import { ClearCartUseCase } from './clear-cart.usecase';

@Controller('cart')
export class ClearCartController {
  constructor(private readonly clearCartUseCase: ClearCartUseCase) {}

  @Delete(':sessionKey')
  async clear(@Param('sessionKey') sessionKey: string) {
    return this.clearCartUseCase.execute(sessionKey);
  }
}
