import { Controller, Get, Param } from '@nestjs/common';
import { GetCartUseCase } from './get-cart.usecase';

@Controller('cart')
export class GetCartController {
  constructor(private readonly getCartUseCase: GetCartUseCase) {}

  @Get(':sessionKey')
  async get(@Param('sessionKey') sessionKey: string) {
    return this.getCartUseCase.execute(sessionKey);
  }
}
