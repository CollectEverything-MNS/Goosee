import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { RegisterUseCase } from './register.usecase';
import { ConfigService } from '@nestjs/config';
import { IAuthRepository } from '../../repositories/auth.repository';
import { IAuthTokenRepository } from '../../repositories/auth-token.repository';
import { RegisterDto } from './register.dto';
import { Auth } from '../../entities/auth.entity';
import { AuthToken } from '../../entities/auth-token.entity';
import { of } from 'rxjs';

describe('RegisterUseCase', () => {
  let usecase: RegisterUseCase;
  let authRepo: jest.Mocked<IAuthRepository>;
  let authTokenRepo: jest.Mocked<IAuthTokenRepository>;
  let rmqAuthClient: any;
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

  const mockRmqAuthClient = {
    emit: jest.fn(),
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
        RegisterUseCase,
        {
          provide: IAuthRepository,
          useValue: mockAuthRepo,
        },
        {
          provide: IAuthTokenRepository,
          useValue: mockAuthTokenRepo,
        },
        {
          provide: 'RMQ_AUTH_CLIENT',
          useValue: mockRmqAuthClient,
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

    usecase = module.get<RegisterUseCase>(RegisterUseCase);
    authRepo = module.get(IAuthRepository);
    authTokenRepo = module.get(IAuthTokenRepository);
    rmqAuthClient = module.get('RMQ_AUTH_CLIENT');
    rmqNotifClient = module.get('RMQ_NOTIF_CLIENT');
    configService = module.get(ConfigService);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const savedAuth = {
      id: 'uuid-456',
      email: 'test@example.com',
      password: 'hashed-password',
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined,
      tokens: [],
    } as Auth;

    it('devrait créer un nouvel utilisateur correctement', async () => {
      authRepo.findByEmail.mockResolvedValue(null);
      authRepo.save.mockResolvedValue(savedAuth);
      authTokenRepo.findByAuthId.mockResolvedValue([]);
      authTokenRepo.save.mockResolvedValue({} as AuthToken);
      rmqAuthClient.emit.mockReturnValue(of({}));
      rmqNotifClient.emit.mockReturnValue(of({}));

      const result = await usecase.execute(registerDto);

      expect(authRepo.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(authRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email,
          password: expect.any(String),
        }),
      );
      const savedPassword = authRepo.save.mock.calls[0][0].password;
      expect(savedPassword).not.toEqual(registerDto.password);
      expect(authTokenRepo.save).toHaveBeenCalled();
      expect(configService.get).toHaveBeenCalledWith('NEXT_PUBLIC_API_URL');
      expect(rmqNotifClient.emit).toHaveBeenCalledWith(
        'send_notification',
        expect.objectContaining({
          type: 'EMAIL',
        })
      );
      expect(rmqAuthClient.emit).toHaveBeenCalledWith('auth.registered', {
        authId: savedAuth.id,
        email: savedAuth.email,
      });
      expect(result).toEqual({
        id: savedAuth.id,
        email: savedAuth.email,
        createdAt: savedAuth.createdAt,
      });
    });

    it("devrait bloquer l'inscription si l'email existe déjà", async () => {
      const existingAuth = {
        id: 'uuid-existing',
        email: 'test@example.com',
        password: 'hashedpass',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
        tokens: [],
      } as Auth;

      authRepo.findByEmail.mockResolvedValue(existingAuth);

      await expect(usecase.execute(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(usecase.execute(registerDto)).rejects.toThrow(
        'Email already exists',
      );
      expect(authRepo.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(authRepo.save).not.toHaveBeenCalled();
      expect(rmqAuthClient.emit).not.toHaveBeenCalled();
      expect(rmqNotifClient.emit).not.toHaveBeenCalled();
    });

    it('devrait hasher le mot de passe avant de sauvegarder', async () => {
      authRepo.findByEmail.mockResolvedValue(null);
      authRepo.save.mockResolvedValue(savedAuth);
      authTokenRepo.findByAuthId.mockResolvedValue([]);
      rmqAuthClient.emit.mockReturnValue(of({}));
      rmqNotifClient.emit.mockReturnValue(of({}));

      await usecase.execute(registerDto);

      expect(authRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          password: expect.not.stringContaining(registerDto.password),
        }),
      );
    });

    it('devrait envoyer un event RabbitMQ après inscription', async () => {
      authRepo.findByEmail.mockResolvedValue(null);
      authRepo.save.mockResolvedValue(savedAuth);
      authTokenRepo.findByAuthId.mockResolvedValue([]);
      authTokenRepo.save.mockResolvedValue({} as AuthToken);
      rmqAuthClient.emit.mockReturnValue(of({}));
      rmqNotifClient.emit.mockReturnValue(of({}));

      await usecase.execute(registerDto);

      expect(rmqAuthClient.emit).toHaveBeenCalledTimes(1);
      expect(rmqNotifClient.emit).toHaveBeenCalledTimes(1);
      expect(rmqAuthClient.emit).toHaveBeenCalledWith('auth.registered', {
        authId: savedAuth.id,
        email: savedAuth.email,
      });
    });

    it('devrait retourner les données utilisateur sans le mot de passe', async () => {
      authRepo.findByEmail.mockResolvedValue(null);
      authRepo.save.mockResolvedValue(savedAuth);
      authTokenRepo.findByAuthId.mockResolvedValue([]);
      rmqAuthClient.emit.mockReturnValue(of({}));
      rmqNotifClient.emit.mockReturnValue(of({}));

      const result = await usecase.execute(registerDto);

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('createdAt');
    });

    it("devrait renvoyer un mail de verification si l'utilisateur existe mais n'est pas verifie", async () => {
      const unverifiedAuth = {
        ...savedAuth,
        id: 'uuid-unverified',
        isVerified: false,
      } as Auth;

      authRepo.findByEmail.mockResolvedValue(unverifiedAuth);
      authTokenRepo.findByAuthId.mockResolvedValue([]);
      authTokenRepo.save.mockResolvedValue({} as AuthToken);
      rmqNotifClient.emit.mockReturnValue(of({}));

      const result = await usecase.execute(registerDto);

      expect(authRepo.save).not.toHaveBeenCalled();
      expect(authTokenRepo.save).toHaveBeenCalledTimes(1);
      expect(rmqNotifClient.emit).toHaveBeenCalledTimes(1);
      expect(rmqAuthClient.emit).not.toHaveBeenCalled();
      expect(result).toEqual({
        id: unverifiedAuth.id,
        email: unverifiedAuth.email,
        createdAt: unverifiedAuth.createdAt,
      });
    });

    it("devrait echouer si NEXT_PUBLIC_API_URL est manquant avant de creer l'utilisateur", async () => {
      configService.get.mockReturnValue(undefined);

      await expect(usecase.execute(registerDto)).rejects.toThrow(
        InternalServerErrorException
      );
      expect(authRepo.findByEmail).not.toHaveBeenCalled();
      expect(authRepo.save).not.toHaveBeenCalled();
    });
  });
});
