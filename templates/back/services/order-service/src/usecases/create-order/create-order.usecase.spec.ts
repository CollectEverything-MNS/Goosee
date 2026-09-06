import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CreateOrderUseCase } from './create-order.usecase';
import { IOrderRepository } from '../../repositories/order.repository';
import { ProductClient } from '../../shared/product-client.service';
import { StockClient } from '../../shared/stock-client.service';
import { CreateOrderDto } from './create-order.dto';
import { Order } from '../../entities/order.entity';

describe('CreateOrderUseCase', () => {
  let usecase: CreateOrderUseCase;
  let orderRepo: jest.Mocked<IOrderRepository>;
  let productClient: jest.Mocked<ProductClient>;
  let stockClient: jest.Mocked<StockClient>;

  const mockOrderRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    findByCustomer: jest.fn(),
  };

  const mockProductClient = {
    getProduct: jest.fn(),
  };

  const mockStockClient = {
    reserve: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOrderUseCase,
        { provide: IOrderRepository, useValue: mockOrderRepo },
        { provide: ProductClient, useValue: mockProductClient },
        { provide: StockClient, useValue: mockStockClient },
      ],
    }).compile();

    usecase = module.get<CreateOrderUseCase>(CreateOrderUseCase);
    orderRepo = module.get(IOrderRepository);
    productClient = module.get(ProductClient);
    stockClient = module.get(StockClient);

    jest.clearAllMocks();
  });

  const dto: CreateOrderDto = {
    customerEmail: 'client@example.com',
    items: [{ productId: 'product-1', name: 'Baguette', unitPriceCents: 130, quantity: 2 }],
  };

  it('devrait créer la commande si le produit est disponible et le stock réservé', async () => {
    productClient.getProduct.mockResolvedValue({
      id: 'product-1',
      name: 'Baguette',
      isAvailable: true,
    });
    stockClient.reserve.mockResolvedValue({ ok: true });
    orderRepo.save.mockImplementation((order) => Promise.resolve(order as Order));

    const result = await usecase.execute(dto);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(stockClient.reserve).toHaveBeenCalledWith(
      expect.any(String),
      [{ productId: 'product-1', quantity: 2 }]
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(orderRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        customerEmail: dto.customerEmail,
        totalCents: 260,
        status: 'pending',
      })
    );
    expect(result.message).toBe('Order created successfully');
  });

  it("devrait refuser la commande si un produit n'est plus disponible (catalogue)", async () => {
    productClient.getProduct.mockResolvedValue({
      id: 'product-1',
      name: 'Baguette',
      isAvailable: false,
    });

    await expect(usecase.execute(dto)).rejects.toThrow(BadRequestException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(stockClient.reserve).not.toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(orderRepo.save).not.toHaveBeenCalled();
  });

  it('devrait refuser la commande si la réservation de stock échoue (stock insuffisant)', async () => {
    productClient.getProduct.mockResolvedValue({
      id: 'product-1',
      name: 'Baguette',
      isAvailable: true,
    });
    stockClient.reserve.mockResolvedValue({
      ok: false,
      shortages: [{ productId: 'product-1', requested: 2, available: 1 }],
    });

    await expect(usecase.execute(dto)).rejects.toThrow(BadRequestException);
    await expect(usecase.execute(dto)).rejects.toThrow(/Baguette/);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(orderRepo.save).not.toHaveBeenCalled();
  });

  it('devrait continuer si product-service est injoignable (check catalogue best-effort)', async () => {
    productClient.getProduct.mockResolvedValue(null);
    stockClient.reserve.mockResolvedValue({ ok: true });
    orderRepo.save.mockImplementation((order) => Promise.resolve(order as Order));

    const result = await usecase.execute(dto);

    expect(result.message).toBe('Order created successfully');
  });
});
