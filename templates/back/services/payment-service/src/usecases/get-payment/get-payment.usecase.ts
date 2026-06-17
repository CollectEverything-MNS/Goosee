import { Injectable, NotFoundException } from '@nestjs/common';
import { IPaymentRepository } from '../../repositories/payment.repository';

@Injectable()
export class GetPaymentUseCase {
  constructor(private readonly paymentRepo: IPaymentRepository) {}

  async execute(id: string) {
    const payment = await this.paymentRepo.findById(id);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return {
      message: 'Payment fetched successfully',
      payment,
    };
  }
}
