import { Body, Controller, Post } from '@nestjs/common';
import { CreatePaymentDto } from './create-payment.dto';
import { CreatePaymentUseCase } from './create-payment.usecase';

@Controller('payments')
export class CreatePaymentController {
  constructor(private readonly createPaymentUseCase: CreatePaymentUseCase) {}

  @Post()
  async create(@Body() dto: CreatePaymentDto) {
    return this.createPaymentUseCase.execute(dto);
  }
}
