import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HandleWebhookUseCase } from './handle-webhook.usecase';
import { IPaymentRepository } from '../../repositories/payment.repository';
import { IPaymentProvider } from '../../providers/payment-provider.interface';
import { Payment } from '../../entities/payment.entity';

describe('HandleWebhookUseCase', () => {
  let usecase: HandleWebhookUseCase;
  let paymentRepo: jest.Mocked<IPaymentRepository>;
  let paymentProvider: jest.Mocked<IPaymentProvider>;
  let fetchMock: jest.Mock;

  const mockPaymentRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    findByProviderRef: jest.fn(),
  };

  const mockPaymentProvider = {
    createIntent: jest.fn(),
    parseWebhookEvent: jest.fn(),
  };

  const mockConfig = {
    get: jest.fn((key: string, def?: string) => {
      const values: Record<string, string> = {
        ORDER_SERVICE_HOST: 'order-host',
        ORDER_SERVICE_PORT: '3007',
      };
      return values[key] ?? def;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleWebhookUseCase,
        { provide: IPaymentRepository, useValue: mockPaymentRepo },
        { provide: IPaymentProvider, useValue: mockPaymentProvider },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    usecase = module.get<HandleWebhookUseCase>(HandleWebhookUseCase);
    paymentRepo = module.get(IPaymentRepository);
    paymentProvider = module.get(IPaymentProvider);

    jest.clearAllMocks();
    fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('devrait acquitter sans rien faire un événement non pertinent', async () => {
    paymentProvider.parseWebhookEvent.mockReturnValue(null);

    const result = await usecase.execute('{}');

    expect(result).toEqual({ received: true, ignored: true });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(paymentRepo.findByProviderRef).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('devrait lever une NotFoundException si aucun paiement ne correspond au providerRef', async () => {
    paymentProvider.parseWebhookEvent.mockReturnValue({ providerRef: 'pi_x', status: 'succeeded' });
    paymentRepo.findByProviderRef.mockResolvedValue(null);

    await expect(usecase.execute('{}')).rejects.toThrow(NotFoundException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(paymentRepo.save).not.toHaveBeenCalled();
  });

  it('devrait passer le paiement à succeeded et propager le statut « paid » à la commande', async () => {
    const payment = new Payment({ id: 'pay-1', orderId: 'order-1', status: 'pending' });
    paymentProvider.parseWebhookEvent.mockReturnValue({ providerRef: 'pi_1', status: 'succeeded' });
    paymentRepo.findByProviderRef.mockResolvedValue(payment);
    paymentRepo.save.mockImplementation((p) => Promise.resolve(p as Payment));

    const result = await usecase.execute('raw-body', 'sig');

    expect(payment.status).toBe('succeeded');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(paymentRepo.save).toHaveBeenCalledWith(payment);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://order-host:3007/orders/order-1/status',
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ status: 'paid' }) })
    );
    expect(result).toEqual({ received: true, status: 'succeeded' });
  });

  it('devrait propager le statut « cancelled » à la commande pour un paiement échoué', async () => {
    const payment = new Payment({ id: 'pay-1', orderId: 'order-1', status: 'pending' });
    paymentProvider.parseWebhookEvent.mockReturnValue({ providerRef: 'pi_1', status: 'failed' });
    paymentRepo.findByProviderRef.mockResolvedValue(payment);
    paymentRepo.save.mockImplementation((p) => Promise.resolve(p as Payment));

    await usecase.execute('raw-body');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://order-host:3007/orders/order-1/status',
      expect.objectContaining({ body: JSON.stringify({ status: 'cancelled' }) })
    );
  });

  it('ne doit pas appeler order-service pour un statut sans correspondance commande', async () => {
    const payment = new Payment({ id: 'pay-1', orderId: 'order-1', status: 'pending' });
    paymentProvider.parseWebhookEvent.mockReturnValue({ providerRef: 'pi_1', status: 'pending' });
    paymentRepo.findByProviderRef.mockResolvedValue(payment);
    paymentRepo.save.mockImplementation((p) => Promise.resolve(p as Payment));

    const result = await usecase.execute('raw-body');

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual({ received: true, status: 'pending' });
  });

  it('ne doit pas faire échouer le webhook si order-service est injoignable', async () => {
    const payment = new Payment({ id: 'pay-1', orderId: 'order-1', status: 'pending' });
    paymentProvider.parseWebhookEvent.mockReturnValue({ providerRef: 'pi_1', status: 'succeeded' });
    paymentRepo.findByProviderRef.mockResolvedValue(payment);
    paymentRepo.save.mockImplementation((p) => Promise.resolve(p as Payment));
    fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));

    const result = await usecase.execute('raw-body');

    expect(result).toEqual({ received: true, status: 'succeeded' });
  });

  it('ne doit pas faire échouer le webhook si order-service répond une erreur HTTP', async () => {
    const payment = new Payment({ id: 'pay-1', orderId: 'order-1', status: 'pending' });
    paymentProvider.parseWebhookEvent.mockReturnValue({ providerRef: 'pi_1', status: 'refunded' });
    paymentRepo.findByProviderRef.mockResolvedValue(payment);
    paymentRepo.save.mockImplementation((p) => Promise.resolve(p as Payment));
    fetchMock.mockResolvedValue({ ok: false, status: 500 });

    const result = await usecase.execute('raw-body');

    expect(result).toEqual({ received: true, status: 'refunded' });
  });
});
