import { Test, TestingModule } from '@nestjs/testing';
import { RgpdEraseUseCase } from './rgpd-erase.usecase';
import { ITicketRepository } from '../../repositories/ticket.repository';

describe('RgpdEraseUseCase (ticket)', () => {
  let usecase: RgpdEraseUseCase;
  const mockTicketRepo = {
    save: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    delete: jest.fn(),
    deleteByCustomerId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [RgpdEraseUseCase, { provide: ITicketRepository, useValue: mockTicketRepo }],
    }).compile();
    usecase = module.get<RgpdEraseUseCase>(RgpdEraseUseCase);
  });

  it('supprime les tickets de l acheteur', async () => {
    mockTicketRepo.deleteByCustomerId.mockResolvedValue(3);

    const res = await usecase.execute('c-1');

    expect(mockTicketRepo.deleteByCustomerId).toHaveBeenCalledWith('c-1');
    expect(res).toEqual({ service: 'ticket', statut: 'efface', tickets: 3 });
  });

  it('renvoie "absent" quand il n y avait aucun ticket', async () => {
    mockTicketRepo.deleteByCustomerId.mockResolvedValue(0);

    const res = await usecase.execute('c-1');

    expect(res).toEqual({ service: 'ticket', statut: 'absent', tickets: 0 });
  });
});
