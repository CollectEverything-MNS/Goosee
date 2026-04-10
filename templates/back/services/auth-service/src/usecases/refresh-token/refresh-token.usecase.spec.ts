import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { RefreshTokenUseCase } from './refresh-token.usecase';
import { IAuthRepository } from '../../repositories/auth.repository';
import { IAuthTokenRepository } from '../../repositories/auth-token.repository';
import { JwtTokenService } from '../../shared/services/jwt-token.service';
import { RefreshTokenDto } from './refresh-token.dto';
import { Auth } from '../../entities/auth.entity';
import { AuthToken, AUTH_TOKEN_TYPES } from '../../entities/auth-token.entity';

describe('RefreshTokenUseCase', () => {
  let usecase: RefreshTokenUseCase;
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
        RefreshTokenUseCase,
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

    usecase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    authRepo = module.get(IAuthRepository);
    authTokenRepo = module.get(IAuthTokenRepository);
    jwtTokenService = module.get(JwtTokenService);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const refreshTokenDto: RefreshTokenDto = {
      token: 'valid-refresh-token',
    };

    const storedToken = {
      id: 'token-id',
      authId: 'auth-id',
      token: refreshTokenDto.token,
      type: AUTH_TOKEN_TYPES.refresh,
      expiredAt: new Date(Date.now() + 60 * 60 * 1000),
      createdAt: new Date(),
    } as AuthToken;

    const auth = {
      id: 'auth-id',
      email: 'test@example.com',
      password: 'hashed-password',
      role: ['CUSTOMER'],
      tokenVersion: 0,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined,
      tokens: [],
    } as Auth;

    it('rotates refresh token and returns new token pair', async () => {
      const accessToken = {
        token: 'new-access-token',
        expiredAt: new Date(Date.now() + 15 * 60 * 1000),
      };
      const refreshToken = {
        token: 'new-refresh-token',
        expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      jwtTokenService.verifyRefreshToken.mockReturnValue({
        sub: auth.id,
        email: auth.email,
        roles: auth.role,
        tokenVersion: auth.tokenVersion,
        typ: 'refresh',
      });
      authTokenRepo.findByToken.mockResolvedValue(storedToken);
      authRepo.findById.mockResolvedValue(auth);
      authTokenRepo.save.mockResolvedValue({} as AuthToken);
      jwtTokenService.generateAccessToken.mockReturnValue(accessToken);
      jwtTokenService.generateRefreshToken.mockReturnValue(refreshToken);

      const result = await usecase.execute(refreshTokenDto);

      expect(jwtTokenService.verifyRefreshToken).toHaveBeenCalledWith(refreshTokenDto.token);
      expect(authTokenRepo.findByToken).toHaveBeenCalledWith(refreshTokenDto.token);
      expect(authTokenRepo.deleteByToken).toHaveBeenCalledWith(refreshTokenDto.token);
      expect(authTokenRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          authId: auth.id,
          token: refreshToken.token,
          type: AUTH_TOKEN_TYPES.refresh,
        }),
      );
      expect(result).toEqual({
        accessToken: accessToken.token,
        refreshToken: refreshToken.token,
        accessTokenExpiredAt: accessToken.expiredAt,
        refreshTokenExpiredAt: refreshToken.expiredAt,
      });
    });

    it('throws when token is not found in storage', async () => {
      jwtTokenService.verifyRefreshToken.mockReturnValue({
        sub: auth.id,
        email: auth.email,
        roles: auth.role,
        tokenVersion: auth.tokenVersion,
        typ: 'refresh',
      });
      authTokenRepo.findByToken.mockResolvedValue(null);

      await expect(usecase.execute(refreshTokenDto)).rejects.toThrow(NotFoundException);
      await expect(usecase.execute(refreshTokenDto)).rejects.toThrow('Token not found');
      expect(authTokenRepo.deleteByToken).not.toHaveBeenCalled();
    });

    it('throws when token owner does not match', async () => {
      jwtTokenService.verifyRefreshToken.mockReturnValue({
        sub: 'another-auth-id',
        email: auth.email,
        roles: auth.role,
        tokenVersion: auth.tokenVersion,
        typ: 'refresh',
      });
      authTokenRepo.findByToken.mockResolvedValue(storedToken);

      await expect(usecase.execute(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
      await expect(usecase.execute(refreshTokenDto)).rejects.toThrow('Invalid token owner');
    });

    it('throws when token version does not match', async () => {
      jwtTokenService.verifyRefreshToken.mockReturnValue({
        sub: auth.id,
        email: auth.email,
        roles: auth.role,
        tokenVersion: 99,
        typ: 'refresh',
      });
      authTokenRepo.findByToken.mockResolvedValue(storedToken);
      authRepo.findById.mockResolvedValue(auth);

      await expect(usecase.execute(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
      await expect(usecase.execute(refreshTokenDto)).rejects.toThrow('Token revoked');
      expect(authTokenRepo.deleteByToken).not.toHaveBeenCalled();
    });
  });
});

