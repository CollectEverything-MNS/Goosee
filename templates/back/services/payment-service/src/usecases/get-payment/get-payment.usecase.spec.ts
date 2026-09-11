import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetPaymentUseCase } from './get-payment.usecase';
import { IPaymentRepository } from '../../repositories/payment.repository';
import { Payment } from '../../entities/payment.entity';

describe('GetPaymentUseCase', () => {
  let usecase: GetPaymentUseCase;
  let paymentRepo: jest.Mocked<IPaymentRepository>;

  const mockPaymentRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    findByProviderRef: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPaymentUseCase,
        { provide: IPaymentRepository, useValue: mockPaymentRepo },
      ],
    }).compile();

    usecase = module.get<GetPaymentUseCase>(GetPaymentUseCase);
    paymentRepo = module.get(IPaymentRepository);

    jest.clearAllMocks();
  });

  it('devrait renvoyer le paiement quand il existe', async () => {
    const payment = { id: 'pay-1', status: 'succeeded' } as Payment;
    paymentRepo.findById.mockResolvedValue(payment);

    const result = await usecase.execute('pay-1');

    expect(result).toEqual({ message: 'Payment fetched successfully', payment });
  });

  it('devrait lever une NotFoundException quand le paiement est introuvable', async () => {
    paymentRepo.findById.mockResolvedValue(null);

    await expect(usecase.execute('unknown')).rejects.toThrow(NotFoundException);
  });
});
