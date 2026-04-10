import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
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
import { RevokeTokenUseCase } from './revoke-token.usecase';
import { IAuthTokenRepository } from '../../repositories/auth-token.repository';
import { JwtTokenService } from '../../shared/services/jwt-token.service';
import { RevokeTokenDto } from './revoke-token.dto';
import { AuthToken, AUTH_TOKEN_TYPES } from '../../entities/auth-token.entity';

describe('RevokeTokenUseCase', () => {
  let usecase: RevokeTokenUseCase;
  let authTokenRepo: jest.Mocked<IAuthTokenRepository>;
  let jwtTokenService: jest.Mocked<JwtTokenService>;

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
        RevokeTokenUseCase,
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

    usecase = module.get<RevokeTokenUseCase>(RevokeTokenUseCase);
    authTokenRepo = module.get(IAuthTokenRepository);
    jwtTokenService = module.get(JwtTokenService);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const revokeTokenDto: RevokeTokenDto = {
      token: 'valid-refresh-token',
    };

    const mockAuthToken = {
      id: 'uuid-token-1',
      authId: 'uuid-auth-1',
      token: revokeTokenDto.token,
      type: AUTH_TOKEN_TYPES.refresh,
      expiredAt: new Date(),
      createdAt: new Date(),
    } as AuthToken;

    it('revokes a valid refresh token', async () => {
      jwtTokenService.verifyRefreshToken.mockReturnValue({
        sub: 'uuid-auth-1',
        email: 'test@example.com',
        roles: ['CUSTOMER'],
        tokenVersion: 0,
        typ: 'refresh',
      });
      authTokenRepo.findByToken.mockResolvedValue(mockAuthToken);
      authTokenRepo.deleteByToken.mockResolvedValue(undefined);

      const result = await usecase.execute(revokeTokenDto);

      expect(jwtTokenService.verifyRefreshToken).toHaveBeenCalledWith(revokeTokenDto.token);
      expect(authTokenRepo.findByToken).toHaveBeenCalledWith(revokeTokenDto.token);
      expect(authTokenRepo.deleteByToken).toHaveBeenCalledWith(revokeTokenDto.token);
      expect(result).toEqual({ message: 'Token revoked successfully' });
    });

    it('throws when token does not exist', async () => {
      jwtTokenService.verifyRefreshToken.mockReturnValue({
        sub: 'uuid-auth-1',
        email: 'test@example.com',
        roles: ['CUSTOMER'],
        tokenVersion: 0,
        typ: 'refresh',
      });
      authTokenRepo.findByToken.mockResolvedValue(null);

      await expect(usecase.execute(revokeTokenDto)).rejects.toThrow(NotFoundException);
      await expect(usecase.execute(revokeTokenDto)).rejects.toThrow('Token not found');
      expect(authTokenRepo.deleteByToken).not.toHaveBeenCalled();
    });
  });
});

