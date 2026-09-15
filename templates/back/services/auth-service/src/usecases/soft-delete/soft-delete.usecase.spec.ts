import { Test, TestingModule } from '@nestjs/testing';
import { SoftDeleteUseCase } from './soft-delete.usecase';
import { IAuthRepository } from '../../repositories/auth.repository';
import { IAuthTokenRepository } from '../../repositories/auth-token.repository';

describe('SoftDeleteUseCase', () => {
  let usecase: SoftDeleteUseCase;
  const mockAuthRepo = {
    save: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    softDeleteById: jest.fn(),
    eraseById: jest.fn(),
  };
  const mockTokenRepo = {
    save: jest.fn(),
    findByToken: jest.fn(),
    findByAuthId: jest.fn(),
    deleteByAuthId: jest.fn(),
    deleteByToken: jest.fn(),
    updateExpiredAt: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SoftDeleteUseCase,
        { provide: IAuthRepository, useValue: mockAuthRepo },
        { provide: IAuthTokenRepository, useValue: mockTokenRepo },
      ],
    }).compile();
    usecase = module.get<SoftDeleteUseCase>(SoftDeleteUseCase);
  });

  it('efface reellement la ligne au lieu de poser un drapeau', async () => {
    await usecase.execute({ authId: 'auth-1' });

    expect(mockAuthRepo.eraseById).toHaveBeenCalledWith('auth-1');
    expect(mockAuthRepo.softDeleteById).not.toHaveBeenCalled();
  });

  it('est idempotent : un second appel ne leve pas', async () => {
    await usecase.execute({ authId: 'auth-1' });
    await expect(usecase.execute({ authId: 'auth-1' })).resolves.toBeUndefined();
  });

  it('retire les jetons avant la ligne auth', async () => {
    const ordre: string[] = [];
    mockTokenRepo.deleteByAuthId.mockImplementation(() => {
      ordre.push('jetons');
      return Promise.resolve();
    });
    mockAuthRepo.eraseById.mockImplementation(() => {
      ordre.push('auth');
      return Promise.resolve();
    });

    await usecase.execute({ authId: 'auth-1' });

    expect(ordre).toEqual(['jetons', 'auth']);
  });
});
