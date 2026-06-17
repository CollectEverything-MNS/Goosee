import { Controller, Get, Param } from '@nestjs/common';
import { GetPaymentUseCase } from './get-payment.usecase';

@Controller('payments')
export class GetPaymentController {
  constructor(private readonly getPaymentUseCase: GetPaymentUseCase) {}

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.getPaymentUseCase.execute(id);
  }
}
