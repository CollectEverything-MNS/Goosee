import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UpdateOrderStatusUseCase } from './update-order-status.usecase';
import { IOrderRepository } from '../../repositories/order.repository';
import { Order } from '../../entities/order.entity';

describe('UpdateOrderStatusUseCase', () => {
  let usecase: UpdateOrderStatusUseCase;
  let orderRepo: jest.Mocked<IOrderRepository>;
  let stockClient: jest.Mocked<ClientProxy>;

  const mockOrderRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    findByCustomer: jest.fn(),
  };

  const mockStockClient = {
    emit: jest.fn(),
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateOrderStatusUseCase,
        { provide: IOrderRepository, useValue: mockOrderRepo },
        { provide: 'STOCK_CLIENT', useValue: mockStockClient },
      ],
    }).compile();

    usecase = module.get<UpdateOrderStatusUseCase>(UpdateOrderStatusUseCase);
    orderRepo = module.get(IOrderRepository);
    stockClient = module.get('STOCK_CLIENT');

    jest.clearAllMocks();
  });

  it("devrait lever une NotFoundException si la commande n'existe pas", async () => {
    orderRepo.findById.mockResolvedValue(null);

    await expect(usecase.execute('order-1', { status: 'paid' })).rejects.toThrow(NotFoundException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(stockClient.emit).not.toHaveBeenCalled();
  });

  it('devrait émettre order.paid à la transition vers paid', async () => {
    const order = { id: 'order-1', status: 'pending' } as Order;
    orderRepo.findById.mockResolvedValue(order);
    orderRepo.save.mockImplementation((o) => Promise.resolve(o as Order));

    await usecase.execute('order-1', { status: 'paid' });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(stockClient.emit).toHaveBeenCalledWith('order.paid', { orderId: 'order-1' });
  });

  it('devrait émettre order.cancelled à la transition vers cancelled', async () => {
    const order = { id: 'order-1', status: 'pending' } as Order;
    orderRepo.findById.mockResolvedValue(order);
    orderRepo.save.mockImplementation((o) => Promise.resolve(o as Order));

    await usecase.execute('order-1', { status: 'cancelled' });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(stockClient.emit).toHaveBeenCalledWith('order.cancelled', { orderId: 'order-1' });
  });

  it('ne doit pas réémettre order.paid si la commande est déjà payée (rejeu du webhook)', async () => {
    const order = { id: 'order-1', status: 'paid' } as Order;
    orderRepo.findById.mockResolvedValue(order);
    orderRepo.save.mockImplementation((o) => Promise.resolve(o as Order));

    await usecase.execute('order-1', { status: 'paid' });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(stockClient.emit).not.toHaveBeenCalled();
  });

  it('ne doit rien émettre pour une transition sans effet stock (ex: prepared)', async () => {
    const order = { id: 'order-1', status: 'paid' } as Order;
    orderRepo.findById.mockResolvedValue(order);
    orderRepo.save.mockImplementation((o) => Promise.resolve(o as Order));

    await usecase.execute('order-1', { status: 'prepared' });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(stockClient.emit).not.toHaveBeenCalled();
  });
});
