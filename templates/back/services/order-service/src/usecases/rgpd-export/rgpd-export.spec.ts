import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RgpdExportUseCase } from './rgpd-export.usecase';
import { IOrderRepository } from '../../repositories/order.repository';

describe('RgpdExportUseCase', () => {
  let usecase: RgpdExportUseCase;
  let mockOrderRepo: jest.Mocked<IOrderRepository>;

  beforeEach(async () => {
    mockOrderRepo = {
      findByCustomerIncludingArchived: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RgpdExportUseCase,
        {
          provide: IOrderRepository,
          useValue: mockOrderRepo,
        },
      ],
    }).compile();

    usecase = module.get<RgpdExportUseCase>(RgpdExportUseCase);
  });

  it('restitue les commandes avec montant en centimes', async () => {
    mockOrderRepo.findByCustomerIncludingArchived.mockResolvedValue([
      {
        id: 'ord-1',
        customerId: 'c-1',
        customerEmail: 'test@test.fr',
        items: [{ productId: 'p1', name: 'Product', unitPriceCents: 1000, quantity: 1 }],
        totalCents: 1000,
        billingAddress: { fullName: 'Test User', line1: 'Street', postalCode: '75000', city: 'Paris', country: 'FR' },
        status: 'paid',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        archivedAt: null,
      } as any,
    ]);

    const res = await usecase.execute('c-1');

    expect(res.commandes).toHaveLength(1);
    expect(res.commandes[0].id).toBe('ord-1');
    expect(res.commandes[0].montantCentimes).toBe(1000);
    expect(res.commandes[0].billingAddress?.fullName).toBe('Test User');
  });

  // Article 20 : la restitution porte sur les donnees fournies par la personne.
  it('restitue le courriel et le statut de la commande', async () => {
    mockOrderRepo.findByCustomerIncludingArchived.mockResolvedValue([
      {
        id: 'ord-1',
        customerId: 'c-1',
        customerEmail: 'test@test.fr',
        items: [],
        totalCents: 1000,
        status: 'paid',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        archivedAt: null,
      } as any,
    ]);

    const res = await usecase.execute('c-1');

    expect(res.commandes[0].courriel).toBe('test@test.fr');
    expect(res.commandes[0].statut).toBe('paid');
  });

  it('utilise la methode findByCustomerIncludingArchived', async () => {
    mockOrderRepo.findByCustomerIncludingArchived.mockResolvedValue([]);

    await usecase.execute('c-1');

    expect(mockOrderRepo.findByCustomerIncludingArchived).toHaveBeenCalledWith('c-1');
  });
});
