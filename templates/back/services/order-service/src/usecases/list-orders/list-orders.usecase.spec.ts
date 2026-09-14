import { Test, TestingModule } from '@nestjs/testing';
import { ListOrdersUseCase } from './list-orders.usecase';
import { IOrderRepository } from '../../repositories/order.repository';
import { Order } from '../../entities/order.entity';

describe('ListOrdersUseCase', () => {
  let usecase: ListOrdersUseCase;
  let orderRepo: jest.Mocked<IOrderRepository>;

  const mockOrderRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    findByCustomer: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListOrdersUseCase, { provide: IOrderRepository, useValue: mockOrderRepo }],
    }).compile();

    usecase = module.get<ListOrdersUseCase>(ListOrdersUseCase);
    orderRepo = module.get(IOrderRepository);

    jest.clearAllMocks();
  });

  it('devrait renvoyer toutes les commandes quand aucun client n\'est précisé', async () => {
    const orders = [{ id: 'order-1' }, { id: 'order-2' }] as Order[];
    orderRepo.list.mockResolvedValue(orders);

    const result = await usecase.execute();

    expect(result).toEqual({ message: 'Orders fetched successfully', orders });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(orderRepo.findByCustomer).not.toHaveBeenCalled();
  });

  it('devrait ne renvoyer que les commandes du client quand un customerId est fourni', async () => {
    const orders = [{ id: 'order-3' }] as Order[];
    orderRepo.findByCustomer.mockResolvedValue(orders);

    const result = await usecase.execute('cust-1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(orderRepo.findByCustomer).toHaveBeenCalledWith('cust-1');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(orderRepo.list).not.toHaveBeenCalled();
    expect(result.orders).toBe(orders);
  });
});
