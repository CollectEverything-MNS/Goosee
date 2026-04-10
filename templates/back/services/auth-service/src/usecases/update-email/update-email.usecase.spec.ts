import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { UpdateEmailUseCase } from './update-email.usecase';
import { IAuthRepository } from '../../repositories/auth.repository';
import { IAuthTokenRepository } from '../../repositories/auth-token.repository';
import { JwtTokenService } from '../../shared/services/jwt-token.service';
import { UpdateEmailDto } from './update-email.dto';
import { Auth } from '../../entities/auth.entity';
import { AUTH_TOKEN_TYPES } from '../../entities/auth-token.entity';

describe('UpdateEmailUseCase', () => {
  let usecase: UpdateEmailUseCase;
  let authRepo: jest.Mocked<IAuthRepository>;
  let authTokenRepo: jest.Mocked<IAuthTokenRepository>;
  let jwtTokenService: jest.Mocked<JwtTokenService>;

  const mockAuthRepo = {
    findByEmail: jest.fn(),
    save: jest.fn(),
    findById: jest.fn(),
    softDeleteById: jest.fn(),
  };

  const mockAuthTokenRepo = {
    save: jest.fn(),
    findByToken: jest.fn(),
    findByAuthId: jest.fn(),
    deleteByAuthId: jest.fn(),
    deleteByToken: jest.fn(),
    updateExpiredAt: jest.fn(),
  };

  const mockJwtTokenService = {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateEmailUseCase,
        {
          provide: IAuthRepository,
          useValue: mockAuthRepo,
        },
        {
          provide: IAuthTokenRepository,
          useValue: mockAuthTokenRepo,
        },
        {
          provide: JwtTokenService,
          useValue: mockJwtTokenService,
        },
      ],
    }).compile();

    usecase = module.get<UpdateEmailUseCase>(UpdateEmailUseCase);
    authRepo = module.get(IAuthRepository);
    authTokenRepo = module.get(IAuthTokenRepository);
    jwtTokenService = module.get(JwtTokenService);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const baseDto: UpdateEmailDto = {
      authId: 'uuid-update-email',
      newEmail: 'newemail@example.com',
    };

    const buildAuth = (): Auth =>
      ({
        id: 'uuid-update-email',
        email: 'oldemail@example.com',
        password: 'hashedPassword',
        role: ['CUSTOMER'],
        tokenVersion: 0,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
        tokens: [],
      }) as Auth;

    it('updates email when available', async () => {
      const auth = buildAuth();
      authRepo.findById.mockResolvedValue(auth);
      authRepo.findByEmail.mockResolvedValue(null);
      authRepo.save.mockResolvedValue({ ...auth, email: baseDto.newEmail! });

      await usecase.execute(baseDto);

      expect(authRepo.findById).toHaveBeenCalledWith(baseDto.authId);
      expect(authRepo.findByEmail).toHaveBeenCalledWith(baseDto.newEmail);
      expect(authRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: baseDto.newEmail,
        }),
      );
    });

    it('does nothing when user does not exist', async () => {
      authRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute(baseDto)).resolves.toBeUndefined();
      expect(authRepo.findByEmail).not.toHaveBeenCalled();
      expect(authRepo.save).not.toHaveBeenCalled();
    });

    it('rejects when the new email is already used', async () => {
      authRepo.findById.mockResolvedValue(buildAuth());
      authRepo.findByEmail.mockResolvedValue({
        ...buildAuth(),
        id: 'another-id',
        email: baseDto.newEmail!,
      } as Auth);

      await expect(usecase.execute(baseDto)).rejects.toThrow(ConflictException);
      await expect(usecase.execute(baseDto)).rejects.toThrow('Email already exists');
      expect(authRepo.save).not.toHaveBeenCalled();
    });

    it('updates role when provided', async () => {
      const auth = buildAuth();
      authRepo.findById.mockResolvedValue(auth);
      authRepo.save.mockResolvedValue({ ...auth, role: ['ADMIN'] });
      jwtTokenService.generateRefreshToken.mockReturnValue({
        token: 'new-refresh-token',
        expiredAt: new Date('2030-01-01T00:00:00.000Z'),
      });

      await usecase.execute({
        authId: auth.id,
        role: ['ADMIN'],
      });

      expect(authRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          role: ['ADMIN'],
          tokenVersion: 1,
        }),
      );
      expect(authTokenRepo.deleteByAuthId).toHaveBeenCalledWith(auth.id);
      expect(jwtTokenService.generateRefreshToken).toHaveBeenCalledWith({
        sub: auth.id,
        email: auth.email,
        roles: ['ADMIN'],
        tokenVersion: 1,
      });
      expect(authTokenRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          authId: auth.id,
          token: 'new-refresh-token',
          type: AUTH_TOKEN_TYPES.refresh,
        }),
      );
    });

    it('does not rotate refresh tokens when role does not change', async () => {
      const auth = buildAuth();
      authRepo.findById.mockResolvedValue(auth);
      authRepo.save.mockResolvedValue(auth);

      await usecase.execute({
        authId: auth.id,
        role: ['CUSTOMER'],
      });

      expect(authTokenRepo.deleteByAuthId).not.toHaveBeenCalled();
      expect(jwtTokenService.generateRefreshToken).not.toHaveBeenCalled();
      expect(authTokenRepo.save).not.toHaveBeenCalled();
    });
  });
});

