import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';
import { DeleteUserUseCase } from './delete-user.usecase';
import { IUserRepository } from '../../repositories/user.repository';
import { LogClient } from '../../shared/log-client.service';

describe('DeleteUserUseCase', () => {
  let usecase: DeleteUserUseCase;
  let mockUserRepo: any;
  let mockLogClient: any;
  let mockRmqClient: any;

  beforeEach(async () => {
    mockUserRepo = {
      findById: jest.fn(),
      deleteById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      list: jest.fn(),
    };

    mockLogClient = {
      info: jest.fn(),
      success: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
      critical: jest.fn(),
      debug: jest.fn(),
    };

    mockRmqClient = {
      emit: jest.fn().mockReturnValue(of(undefined)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
        {
          provide: IUserRepository,
          useValue: mockUserRepo,
        },
        {
          provide: LogClient,
          useValue: mockLogClient,
        },
        {
          provide: 'RMQ_CLIENT',
          useValue: mockRmqClient,
        },
      ],
    }).compile();

    usecase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('ne journalise pas le courriel de la personne effacee', async () => {
      mockUserRepo.findById.mockResolvedValue({
        id: 'u-1',
        email: 'acheteur@exemple.fr',
        authId: 'auth-1',
      });

      await usecase.execute('u-1');

      const messages = mockLogClient.success.mock.calls.map((c) => JSON.stringify(c[0]));
      expect(messages.join(' ')).not.toContain('acheteur@exemple.fr');
      expect(messages.join(' ')).toContain('u-1');
    });
  });
});
