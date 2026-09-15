import { Test, TestingModule } from '@nestjs/testing';
import { RgpdEraseUseCase } from './rgpd-erase.usecase';
import { ILogRepository } from '../../repositories/log.repository';

describe('RgpdEraseUseCase (log)', () => {
  let usecase: RgpdEraseUseCase;
  const mockLogRepo = { save: jest.fn(), list: jest.fn(), deleteByUserId: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [RgpdEraseUseCase, { provide: ILogRepository, useValue: mockLogRepo }],
    }).compile();
    usecase = module.get<RgpdEraseUseCase>(RgpdEraseUseCase);
  });

  it('purge les traces portant l identifiant de l acheteur', async () => {
    mockLogRepo.deleteByUserId.mockResolvedValue(12);

    const res = await usecase.execute('c-1');

    expect(mockLogRepo.deleteByUserId).toHaveBeenCalledWith('c-1');
    expect(res).toEqual({ service: 'log', statut: 'efface', entrees: 12 });
  });

  it('renvoie "absent" quand il n y avait aucune trace', async () => {
    mockLogRepo.deleteByUserId.mockResolvedValue(0);

    const res = await usecase.execute('c-1');

    expect(res).toEqual({ service: 'log', statut: 'absent', entrees: 0 });
  });
});
