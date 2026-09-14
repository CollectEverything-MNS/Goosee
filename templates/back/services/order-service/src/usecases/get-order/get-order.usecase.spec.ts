import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetOrderUseCase } from './get-order.usecase';
import { IOrderRepository } from '../../repositories/order.repository';
import { Order } from '../../entities/order.entity';

describe('GetOrderUseCase', () => {
  let usecase: GetOrderUseCase;
  let orderRepo: jest.Mocked<IOrderRepository>;

  const mockOrderRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    findByCustomer: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetOrderUseCase, { provide: IOrderRepository, useValue: mockOrderRepo }],
    }).compile();

    usecase = module.get<GetOrderUseCase>(GetOrderUseCase);
    orderRepo = module.get(IOrderRepository);

    jest.clearAllMocks();
  });

  it('devrait renvoyer la commande quand elle existe', async () => {
    const order = { id: 'order-1', status: 'pending' } as Order;
    orderRepo.findById.mockResolvedValue(order);

    const result = await usecase.execute('order-1');

    expect(result).toEqual({ message: 'Order fetched successfully', order });
  });

  it('devrait lever une NotFoundException quand la commande est introuvable', async () => {
    orderRepo.findById.mockResolvedValue(null);

    await expect(usecase.execute('unknown')).rejects.toThrow(NotFoundException);
  });
});
