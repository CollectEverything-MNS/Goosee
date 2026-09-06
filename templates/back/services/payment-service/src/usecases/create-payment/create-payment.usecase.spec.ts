import { Test, TestingModule } from '@nestjs/testing';
import { CreatePaymentUseCase } from './create-payment.usecase';
import { IPaymentRepository } from '../../repositories/payment.repository';
import { IPaymentProvider } from '../../providers/payment-provider.interface';
import { CreatePaymentDto } from './create-payment.dto';
import { Payment } from '../../entities/payment.entity';

describe('CreatePaymentUseCase', () => {
  let usecase: CreatePaymentUseCase;
  let paymentRepo: jest.Mocked<IPaymentRepository>;
  let paymentProvider: jest.Mocked<IPaymentProvider>;

  const mockPaymentRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    findByProviderRef: jest.fn(),
  };

  const mockPaymentProvider = {
    createIntent: jest.fn(),
    parseWebhookEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePaymentUseCase,
        { provide: IPaymentRepository, useValue: mockPaymentRepo },
        { provide: IPaymentProvider, useValue: mockPaymentProvider },
      ],
    }).compile();

    usecase = module.get<CreatePaymentUseCase>(CreatePaymentUseCase);
    paymentRepo = module.get(IPaymentRepository);
    paymentProvider = module.get(IPaymentProvider);

    jest.clearAllMocks();
  });

  const dto: CreatePaymentDto = {
    orderId: '11111111-1111-1111-1111-111111111111',
    amountCents: 2599,
  };

  it('devrait enregistrer un paiement pending, créer l\'intention puis stocker la référence provider', async () => {
    // save renvoie l'entité passée en lui donnant un id (1er appel), puis telle quelle (2e appel).
    paymentRepo.save
      .mockImplementationOnce((p) => Promise.resolve(Object.assign(p, { id: 'pay-1' })))
      .mockImplementationOnce((p) => Promise.resolve(p as Payment));
    paymentProvider.createIntent.mockResolvedValue({
      providerRef: 'pi_123',
      clientSecret: 'pi_123_secret',
    });

    const result = await usecase.execute(dto);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(paymentRepo.save).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        orderId: dto.orderId,
        amountCents: 2599,
        currency: 'eur',
        status: 'pending',
        provider: 'stripe',
      })
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(paymentProvider.createIntent).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'pay-1' })
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(paymentRepo.save).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ id: 'pay-1', providerRef: 'pi_123' })
    );
    expect(result).toEqual({
      message: 'Payment intent created successfully',
      payment: expect.objectContaining({ providerRef: 'pi_123' }),
      clientSecret: 'pi_123_secret',
    });
  });

  it('devrait utiliser la devise fournie quand elle est précisée', async () => {
    paymentRepo.save.mockImplementation((p) => Promise.resolve(p as Payment));
    paymentProvider.createIntent.mockResolvedValue({
      providerRef: 'pi_456',
      clientSecret: 'pi_456_secret',
    });

    await usecase.execute({ ...dto, currency: 'usd' });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(paymentRepo.save).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ currency: 'usd' })
    );
  });
});
