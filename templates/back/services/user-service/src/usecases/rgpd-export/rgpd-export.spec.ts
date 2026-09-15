import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RgpdExportUseCase } from './rgpd-export.usecase';
import { IUserRepository } from '../../repositories/user.repository';

describe('RgpdExportUseCase', () => {
  let usecase: RgpdExportUseCase;
  let mockUserRepo: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    mockUserRepo = {
      findById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RgpdExportUseCase,
        {
          provide: IUserRepository,
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    usecase = module.get<RgpdExportUseCase>(RgpdExportUseCase);
  });

  it('restitue le profil sans le condensat du mot de passe', async () => {
    mockUserRepo.findById.mockResolvedValue({
      id: 'c-1',
      email: 'a@b.fr',
      firstName: 'Lea',
      lastName: 'Marchand',
      phone: '0600000000',
      password: '$2b$12$condensat',
    } as any);

    const res = await usecase.execute('c-1');

    expect(JSON.stringify(res)).not.toContain('$2b$12$condensat');
    expect(JSON.stringify(res)).not.toContain('password');
    expect(res.compte.email).toBe('a@b.fr');
  });
});
