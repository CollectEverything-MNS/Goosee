import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { RgpdEraseUseCase } from './rgpd-erase.usecase';
import { IUserRepository } from '../../repositories/user.repository';
import { CATEGORIE_PREUVE_RGPD, LogClient } from '../../shared/log-client.service';

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
  const mockLogClient = {
    info: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    critical: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RgpdEraseUseCase,
        { provide: IUserRepository, useValue: mockUserRepo },
        { provide: 'RMQ_CLIENT', useValue: mockRmq },
        { provide: LogClient, useValue: mockLogClient },
      ],
    }).compile();
    usecase = module.get<RgpdEraseUseCase>(RgpdEraseUseCase);
  });

  const loggedPayloads = () =>
    [
      ...mockLogClient.success.mock.calls,
      ...mockLogClient.warning.mock.calls,
      ...mockLogClient.error.mock.calls,
    ].map((c) => JSON.stringify(c[0]));

  it('supprime le profil et propage l effacement a auth', async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 'c-1', email: 'a@b.fr', authId: 'auth-1' });

    const res = await usecase.execute('c-1');

    expect(mockUserRepo.deleteById).toHaveBeenCalledWith('c-1');
    expect(mockRmq.emit).toHaveBeenCalledWith('user.deleted', { authId: 'auth-1' });
    expect(res).toEqual({ service: 'user', statut: 'efface', authPropage: true });
    expect(mockLogClient.success).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'c-1' }),
    );
    expect(loggedPayloads().join(' ')).not.toContain('a@b.fr');
    expect(loggedPayloads().join(' ')).toContain('c-1');
  });

  it('n emet rien quand le profil n a pas de compte auth', async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 'c-1', email: 'a@b.fr' });

    const res = await usecase.execute('c-1');

    expect(mockRmq.emit).not.toHaveBeenCalled();
    expect(res).toEqual({ service: 'user', statut: 'efface', authPropage: false });
    expect(mockLogClient.success).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'c-1' }),
    );
    expect(loggedPayloads().join(' ')).not.toContain('a@b.fr');
    expect(loggedPayloads().join(' ')).toContain('c-1');
  });

  // Ce service est le seul a connaitre la correspondance customerId -> authId.
  // Si le profil partait avant la propagation, un courtier en panne laisserait
  // la ligne auth (courriel, condensat) vivante et plus aucun code ne saurait
  // la designer : le rejeu ne trouverait qu'un profil absent.
  it('laisse le profil intact quand la propagation a auth echoue', async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 'c-1', email: 'a@b.fr', authId: 'auth-1' });
    mockRmq.emit.mockReturnValueOnce(throwError(() => new Error('courtier indisponible')));

    const res = await usecase.execute('c-1');

    expect(mockUserRepo.deleteById).not.toHaveBeenCalled();
    expect(res).toEqual({
      service: 'user',
      statut: 'echec',
      authPropage: false,
      raison: 'courtier indisponible',
    });
    expect(mockLogClient.error).toHaveBeenCalledWith(expect.objectContaining({ userId: 'c-1' }));
    expect(loggedPayloads().join(' ')).not.toContain('a@b.fr');
  });

  it('un rejeu apres un echec de propagation retrouve authId et aboutit', async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 'c-1', email: 'a@b.fr', authId: 'auth-1' });
    mockRmq.emit.mockReturnValueOnce(throwError(() => new Error('courtier indisponible')));

    expect((await usecase.execute('c-1')).statut).toBe('echec');

    // Le depot n'a rien perdu : le second passage lit le meme profil et
    // retrouve donc authId, que lui seul pouvait fournir.
    mockRmq.emit.mockReturnValueOnce(of(undefined));
    const rejeu = await usecase.execute('c-1');

    expect(rejeu).toEqual({ service: 'user', statut: 'efface', authPropage: true });
    expect(mockRmq.emit).toHaveBeenLastCalledWith('user.deleted', { authId: 'auth-1' });
    expect(mockUserRepo.deleteById).toHaveBeenCalledTimes(1);
    expect(mockUserRepo.deleteById).toHaveBeenCalledWith('c-1');
  });

  it('renvoie "absent" si le profil n existe plus, sans lever', async () => {
    mockUserRepo.findById.mockResolvedValue(null);

    const res = await usecase.execute('c-1');

    expect(res).toEqual({ service: 'user', statut: 'absent', authPropage: false });
    expect(mockUserRepo.deleteById).not.toHaveBeenCalled();
    expect(mockLogClient.warning).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'c-1' }),
    );
    expect(loggedPayloads().join(' ')).not.toContain('a@b.fr');
    expect(loggedPayloads().join(' ')).toContain('c-1');
  });

  // Sans cette categorie la purge de log-service emporte la trace, et rejouer un
  // effacement detruit la preuve du precedent — constate a l'execution le 15/09.
  it('marque chaque trace d effacement comme preuve, quel que soit l issue', async () => {
    const cas: Array<() => void> = [
      () => mockUserRepo.findById.mockResolvedValue({ id: 'c-1', authId: 'auth-1' }),
      () => mockUserRepo.findById.mockResolvedValue({ id: 'c-1', authId: null }),
      () => mockUserRepo.findById.mockResolvedValue(null),
      () => {
        mockUserRepo.findById.mockResolvedValue({ id: 'c-1', authId: 'auth-1' });
        mockRmq.emit.mockReturnValueOnce(throwError(() => new Error('courtier indisponible')));
      },
    ];

    for (const preparer of cas) {
      jest.clearAllMocks();
      mockRmq.emit.mockReturnValue(of(undefined));
      preparer();

      await usecase.execute('c-1');

      const tracees = [
        ...mockLogClient.success.mock.calls,
        ...mockLogClient.warning.mock.calls,
        ...mockLogClient.error.mock.calls,
      ];
      expect(tracees).toHaveLength(1);
      expect(tracees[0][0]).toEqual(
        expect.objectContaining({ categorie: CATEGORIE_PREUVE_RGPD }),
      );
    }
  });
});
