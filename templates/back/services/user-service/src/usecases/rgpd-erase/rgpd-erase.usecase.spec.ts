import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { RgpdEraseUseCase } from './rgpd-erase.usecase';
import { IUserRepository } from '../../repositories/user.repository';

describe('RgpdEraseUseCase (user)', () => {
  let usecase: RgpdEraseUseCase;
  const mockUserRepo = {
    findById: jest.fn(),
    deleteById: jest.fn(),
    save: jest.fn(),
    findByEmail: jest.fn(),
    list: jest.fn(),
  };
  const mockRmq = { emit: jest.fn().mockReturnValue(of(undefined)) };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RgpdEraseUseCase,
        { provide: IUserRepository, useValue: mockUserRepo },
        { provide: 'RMQ_CLIENT', useValue: mockRmq },
      ],
    }).compile();
    usecase = module.get<RgpdEraseUseCase>(RgpdEraseUseCase);
  });

  it('supprime le profil et propage l effacement a auth', async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 'c-1', email: 'a@b.fr', authId: 'auth-1' });

    const res = await usecase.execute('c-1');

    expect(mockUserRepo.deleteById).toHaveBeenCalledWith('c-1');
    expect(mockRmq.emit).toHaveBeenCalledWith('user.deleted', { authId: 'auth-1' });
    expect(res).toEqual({ service: 'user', statut: 'efface', authPropage: true });
  });

  it('n emet rien quand le profil n a pas de compte auth', async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 'c-1', email: 'a@b.fr' });

    const res = await usecase.execute('c-1');

    expect(mockRmq.emit).not.toHaveBeenCalled();
    expect(res).toEqual({ service: 'user', statut: 'efface', authPropage: false });
  });

  it('renvoie "absent" si le profil n existe plus, sans lever', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    const res = await usecase.execute('c-1');

    expect(res).toEqual({ service: 'user', statut: 'absent', authPropage: false });
    expect(mockUserRepo.deleteById).not.toHaveBeenCalled();
  });
});
