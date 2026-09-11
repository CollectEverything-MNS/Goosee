import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ForgetPasswordRequestUseCase } from './forget-password-request.usecase';
import { IAuthRepository } from '../../repositories/auth.repository';
import { IAuthTokenRepository } from '../../repositories/auth-token.repository';
import { Auth } from '../../entities/auth.entity';
import { AuthToken } from '../../entities/auth-token.entity';
import { of } from 'rxjs';

describe('ForgetPasswordRequestUseCase', () => {
  let usecase: ForgetPasswordRequestUseCase;
  let authRepo: jest.Mocked<IAuthRepository>;
  let tokenRepo: jest.Mocked<IAuthTokenRepository>;
  let rmqNotifClient: { emit: jest.Mock };

  const mockAuthRepo = {
    findByEmail: jest.fn(),
    save: jest.fn(),
    findById: jest.fn(),
    softDeleteById: jest.fn(),
  };

  const mockTokenRepo = {
    save: jest.fn(),
    findByToken: jest.fn(),
    deleteByToken: jest.fn(),
    updateExpiredAt: jest.fn(),
  };

  const mockRmqNotifClient = {
    emit: jest.fn().mockReturnValue(of({})),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForgetPasswordRequestUseCase,
        {
          provide: IAuthRepository,
          useValue: mockAuthRepo,
        },
        {
          provide: IAuthTokenRepository,
          useValue: mockTokenRepo,
        },
        {
          provide: 'RMQ_NOTIF_CLIENT',
          useValue: mockRmqNotifClient,
        },
      ],
    }).compile();

    usecase = module.get<ForgetPasswordRequestUseCase>(ForgetPasswordRequestUseCase);
    authRepo = module.get(IAuthRepository);
    tokenRepo = module.get(IAuthTokenRepository);
    rmqNotifClient = module.get('RMQ_NOTIF_CLIENT');

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const email = 'test@example.com';

    const mockAuth = {
      id: 'uuid-password-reset',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: ['CUSTOMER'],
      isVerified: true,
      tokenVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined,
      tokens: [],
    } as Auth;

    it('devrait générer un code OTP pour un email valide', async () => {
      authRepo.findByEmail.mockResolvedValue(mockAuth);
      tokenRepo.save.mockResolvedValue({} as AuthToken);

      const result = await usecase.execute(email);

      expect(authRepo.findByEmail).toHaveBeenCalledWith(email);
      expect(tokenRepo.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'OTP sent to email (Regarder dans RABBITMQ dans les message dans le queue)',
      });
    });

    it("devrait bloquer si l'utilisateur existe pas", async () => {
      authRepo.findByEmail.mockResolvedValue(null);

      await expect(usecase.execute(email)).rejects.toThrow(NotFoundException);
      await expect(usecase.execute(email)).rejects.toThrow('User not found');
      expect(authRepo.findByEmail).toHaveBeenCalledWith(email);
      expect(tokenRepo.save).not.toHaveBeenCalled();
    });

    it('devrait générer un code OTP à 6 chiffres', async () => {
      authRepo.findByEmail.mockResolvedValue(mockAuth);
      tokenRepo.save.mockResolvedValue({} as AuthToken);

      await usecase.execute(email);

      expect(tokenRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          authId: mockAuth.id,
          token: expect.stringMatching(/^OTP_\d{6}$/),
        })
      );
    });

    it('devrait faire expirer le token après 10 minutes', async () => {
      authRepo.findByEmail.mockResolvedValue(mockAuth);
      tokenRepo.save.mockResolvedValue({} as AuthToken);

      const beforeExecution = Date.now();
      await usecase.execute(email);
      const afterExecution = Date.now();

      const expectedMinExpiration = beforeExecution + 1000 * 60 * 10;
      const expectedMaxExpiration = afterExecution + 1000 * 60 * 10;

      expect(tokenRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          expiredAt: expect.any(Date),
        })
      );

      const savedToken = tokenRepo.save.mock.calls[0][0];
      const expiredAtTime = savedToken.expiredAt.getTime();

      expect(expiredAtTime).toBeGreaterThanOrEqual(expectedMinExpiration);
      expect(expiredAtTime).toBeLessThanOrEqual(expectedMaxExpiration);
    });

    it('devrait sauvegarder le token avec le bon authId', async () => {
      authRepo.findByEmail.mockResolvedValue(mockAuth);
      tokenRepo.save.mockResolvedValue({} as AuthToken);

      await usecase.execute(email);

      expect(tokenRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          authId: mockAuth.id,
        })
      );
    });

    it("devrait publier l'envoi de notification email", async () => {
      authRepo.findByEmail.mockResolvedValue(mockAuth);
      tokenRepo.save.mockResolvedValue({} as AuthToken);

      await usecase.execute(email);

      expect(rmqNotifClient.emit).toHaveBeenCalledWith(
        'send_notification',
        expect.objectContaining({
          type: 'EMAIL',
          data: expect.objectContaining({
            to: email,
          }),
        }),
      );
    });

    it('devrait générer un code différent à chaque fois', async () => {
      authRepo.findByEmail.mockResolvedValue(mockAuth);
      tokenRepo.save.mockResolvedValue({} as AuthToken);

      await usecase.execute(email);
      const firstToken = tokenRepo.save.mock.calls[0][0].token;

      jest.clearAllMocks();

      await usecase.execute(email);
      const secondToken = tokenRepo.save.mock.calls[0][0].token;

      // Note: There's a very small chance they could be equal, but extremely unlikely
      expect(firstToken).not.toBe(secondToken);
    });
  });
});

