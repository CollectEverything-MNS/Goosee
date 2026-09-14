import { Test, TestingModule } from '@nestjs/testing';
import { RgpdEraseUseCase } from './rgpd-erase.usecase';
import { IOrderRepository } from '../../repositories/order.repository';

describe('RgpdEraseUseCase (order)', () => {
  let usecase: RgpdEraseUseCase;
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
      providers: [RgpdEraseUseCase, { provide: IOrderRepository, useValue: mockOrderRepo }],
    }).compile();
    usecase = module.get<RgpdEraseUseCase>(RgpdEraseUseCase);
  });

  it('archive les commandes sans les effacer', async () => {
    mockOrderRepo.archiveByCustomerId.mockResolvedValue(3);

    const res = await usecase.execute('c-1');

    expect(mockOrderRepo.archiveByCustomerId).toHaveBeenCalledWith('c-1', expect.any(Date));
    expect(res).toEqual({ service: 'order', statut: 'archive', commandes: 3 });
  });

  it("n'expose aucune methode de suppression de commande", () => {
    // Une facture doit porter nom et adresse pour rester valable : l'effacement
    // serait une faute, pas une precaution.
    expect((mockOrderRepo as Record<string, unknown>).deleteByCustomerId).toBeUndefined();
  });
});
