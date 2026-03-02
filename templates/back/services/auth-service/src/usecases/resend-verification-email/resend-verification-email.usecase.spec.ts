import { Test, TestingModule } from '@nestjs/testing';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { Auth } from '../../entities/auth.entity';
import { AuthToken, AUTH_TOKEN_TYPES } from '../../entities/auth-token.entity';
import { IAuthRepository } from '../../repositories/auth.repository';
import { IAuthTokenRepository } from '../../repositories/auth-token.repository';
import { ResendVerificationEmailUseCase } from './resend-verification-email.usecase';

describe('ResendVerificationEmailUseCase', () => {
  let usecase: ResendVerificationEmailUseCase;
  let authRepo: jest.Mocked<IAuthRepository>;
  let authTokenRepo: jest.Mocked<IAuthTokenRepository>;
  let rmqNotifClient: any;
  let configService: any;

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

  const mockRmqNotifClient = {
    emit: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('http://localhost:3001'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResendVerificationEmailUseCase,
        {
          provide: IAuthRepository,
          useValue: mockAuthRepo,
        },
        {
          provide: IAuthTokenRepository,
          useValue: mockAuthTokenRepo,
        },
        {
          provide: 'RMQ_NOTIF_CLIENT',
          useValue: mockRmqNotifClient,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    usecase = module.get<ResendVerificationEmailUseCase>(ResendVerificationEmailUseCase);
    authRepo = module.get(IAuthRepository);
    authTokenRepo = module.get(IAuthTokenRepository);
    rmqNotifClient = module.get('RMQ_NOTIF_CLIENT');
    configService = module.get(ConfigService);

    jest.clearAllMocks();
    configService.get.mockReturnValue('http://localhost:3001');
  });

  it('devrait renvoyer le mail de verification pour un compte non verifie', async () => {
    const auth = {
      id: 'uuid-1',
      email: 'test@example.com',
      isVerified: false,
      createdAt: new Date(),
    } as Auth;

    authRepo.findByEmail.mockResolvedValue(auth);
    authTokenRepo.findByAuthId.mockResolvedValue([
      {
        token: 'old-token',
        type: AUTH_TOKEN_TYPES.emailVerification,
      } as AuthToken,
    ]);
    authTokenRepo.save.mockResolvedValue({} as AuthToken);
    rmqNotifClient.emit.mockReturnValue(of({}));

    const result = await usecase.execute(auth.email);

    expect(authTokenRepo.deleteByToken).toHaveBeenCalledWith('old-token');
    expect(authTokenRepo.save).toHaveBeenCalledTimes(1);
    expect(rmqNotifClient.emit).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ message: 'Verification email sent' });
  });

  it('devrait retourner un message explicite si le compte est deja verifie', async () => {
    const auth = {
      id: 'uuid-2',
      email: 'verified@example.com',
      isVerified: true,
    } as Auth;

    authRepo.findByEmail.mockResolvedValue(auth);

    const result = await usecase.execute(auth.email);

    expect(authTokenRepo.save).not.toHaveBeenCalled();
    expect(rmqNotifClient.emit).not.toHaveBeenCalled();
    expect(result).toEqual({ message: 'Email already verified' });
  });

  it('devrait echouer si NEXT_PUBLIC_API_URL est manquant', async () => {
    configService.get.mockReturnValue(undefined);

    await expect(usecase.execute('test@example.com')).rejects.toThrow(
      InternalServerErrorException
    );
    expect(authRepo.findByEmail).not.toHaveBeenCalled();
  });

  it('devrait echouer si aucun utilisateur ne correspond a cet email', async () => {
    configService.get.mockReturnValue('http://localhost:3001');
    authRepo.findByEmail.mockResolvedValue(null);

    await expect(usecase.execute('missing@example.com')).rejects.toThrow(
      NotFoundException
    );
    expect(authTokenRepo.save).not.toHaveBeenCalled();
    expect(rmqNotifClient.emit).not.toHaveBeenCalled();
  });

});
