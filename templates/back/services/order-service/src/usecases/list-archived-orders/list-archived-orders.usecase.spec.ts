import { Test, TestingModule } from '@nestjs/testing';
import { ListArchivedOrdersUseCase } from './list-archived-orders.usecase';
import { ListArchivedOrdersController } from './list-archived-orders.controller';
import { IOrderRepository } from '../../repositories/order.repository';
import { InternalTokenGuard } from '../../shared/internal-token.guard';
import { Order } from '../../entities/order.entity';

describe('ListArchivedOrdersUseCase', () => {
  let usecase: ListArchivedOrdersUseCase;
  const mockOrderRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    findByCustomer: jest.fn(),
    findByCustomerIncludingArchived: jest.fn(),
    listArchived: jest.fn(),
    archiveByCustomerId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListArchivedOrdersUseCase,
        { provide: IOrderRepository, useValue: mockOrderRepo },
      ],
    }).compile();
    usecase = module.get<ListArchivedOrdersUseCase>(ListArchivedOrdersUseCase);
  });

  it('rend les commandes archivees, que les autres lectures ecartent', async () => {
    const commandes = [{ id: 'ord-1', archivedAt: new Date('2026-01-01') }] as Order[];
    mockOrderRepo.listArchived.mockResolvedValue(commandes);

    const res = await usecase.execute();

    expect(mockOrderRepo.listArchived).toHaveBeenCalledTimes(1);
    expect(res).toEqual({ message: 'Archived orders fetched successfully', commandes });
  });

  it('reste ferme derriere le jeton interne', () => {
    const guards = Reflect.getMetadata('__guards__', ListArchivedOrdersController) ?? [];
    expect(guards).toContain(InternalTokenGuard);
  });
});
