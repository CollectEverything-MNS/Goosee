import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
jest.mock(
  'jsonwebtoken',
  () => ({
    sign: jest.fn(),
    verify: jest.fn(),
    decode: jest.fn(),
    JsonWebTokenError: class JsonWebTokenError extends Error {},
    TokenExpiredError: class TokenExpiredError extends Error {},
  }),
  { virtual: true },
);
import { LoginUseCase } from './login.usecase';
import { IAuthRepository } from '../../repositories/auth.repository';
import { IAuthTokenRepository } from '../../repositories/auth-token.repository';
import { JwtTokenService } from '../../shared/services/jwt-token.service';
import { LoginDto } from './login.dto';
import { Auth } from '../../entities/auth.entity';
import { AuthToken, AUTH_TOKEN_TYPES } from '../../entities/auth-token.entity';

describe('LoginUseCase', () => {
  let usecase: LoginUseCase;
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
        LoginUseCase,
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

    usecase = module.get<LoginUseCase>(LoginUseCase);
    authRepo = module.get(IAuthRepository);
    authTokenRepo = module.get(IAuthTokenRepository);
    jwtTokenService = module.get(JwtTokenService);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    let hashedPassword: string;

    const mockAuth = {
      id: 'uuid-123',
      email: 'test@example.com',
      password: '',
      role: ['CUSTOMER'],
      tokenVersion: 0,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined,
      tokens: [],
    } as Auth;

    beforeEach(async () => {
      hashedPassword = await bcrypt.hash('password123', 12);
      mockAuth.password = hashedPassword;
    });

    it('returns access and refresh tokens for valid credentials', async () => {
      const accessToken = {
        token: 'access-token',
        expiredAt: new Date(Date.now() + 15 * 60 * 1000),
      };
      const refreshToken = {
        token: 'refresh-token',
        expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      authRepo.findByEmail.mockResolvedValue(mockAuth);
      jwtTokenService.generateAccessToken.mockReturnValue(accessToken);
      jwtTokenService.generateRefreshToken.mockReturnValue(refreshToken);
      authTokenRepo.save.mockResolvedValue({} as AuthToken);

      const result = await usecase.execute(loginDto);

      expect(authRepo.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(jwtTokenService.generateAccessToken).toHaveBeenCalledWith({
        sub: mockAuth.id,
        email: mockAuth.email,
        roles: mockAuth.role,
        tokenVersion: mockAuth.tokenVersion,
      });
      expect(jwtTokenService.generateRefreshToken).toHaveBeenCalledWith({
        sub: mockAuth.id,
        email: mockAuth.email,
        roles: mockAuth.role,
        tokenVersion: mockAuth.tokenVersion,
      });
      expect(authTokenRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          authId: mockAuth.id,
          token: refreshToken.token,
          type: AUTH_TOKEN_TYPES.refresh,
          expiredAt: refreshToken.expiredAt,
        }),
      );
      expect(result).toEqual({
        accessToken: accessToken.token,
        refreshToken: refreshToken.token,
        accessTokenExpiredAt: accessToken.expiredAt,
        refreshTokenExpiredAt: refreshToken.expiredAt,
      });
    });

    it('throws when user is not found', async () => {
      authRepo.findByEmail.mockResolvedValue(null);

      await expect(usecase.execute(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(usecase.execute(loginDto)).rejects.toThrow('User not found');
      expect(authTokenRepo.save).not.toHaveBeenCalled();
    });

    it('throws when password is invalid', async () => {
      authRepo.findByEmail.mockResolvedValue(mockAuth);

      await expect(
        usecase.execute({
          email: loginDto.email,
          password: 'wrong-password',
        }),
      ).rejects.toThrow('Invalid credentials');

      expect(authTokenRepo.save).not.toHaveBeenCalled();
    });
  });
});

