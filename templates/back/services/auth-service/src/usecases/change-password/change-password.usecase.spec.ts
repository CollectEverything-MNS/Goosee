import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { ChangePasswordUseCase } from './change-password.usecase';
import { IAuthRepository } from '../../repositories/auth.repository';
import { ChangePasswordDto } from './change-password.dto';
import { Auth } from '../../entities/auth.entity';

describe('ChangePasswordUseCase', () => {
  let usecase: ChangePasswordUseCase;
  let authRepo: jest.Mocked<IAuthRepository>;

  const mockAuthRepo = {
    findByEmail: jest.fn(),
    save: jest.fn(),
    findById: jest.fn(),
    softDeleteById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePasswordUseCase,
        {
          provide: IAuthRepository,
          useValue: mockAuthRepo,
        },
      ],
    }).compile();

    usecase = module.get<ChangePasswordUseCase>(ChangePasswordUseCase);
    authRepo = module.get(IAuthRepository);

    jest.clearAllMocks();
  });

  describe('execute', () => {
    const oldPassword = 'oldPassword123';
    const newPassword = 'newPassword456';

    let hashedOldPassword: string;
    let hashedNewPassword: string;

    const changePasswordDto: ChangePasswordDto = {
      authId: 'uuid-789',
      oldPassword,
      newPassword,
    };

    const mockAuth = {
      id: 'uuid-789',
      email: 'test@example.com',
      password: '',
      role: ['CUSTOMER'],
      isVerified: true,
      tokenVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined,
      tokens: [],
    } as Auth;

    beforeEach(async () => {
      hashedOldPassword = await bcrypt.hash(oldPassword, 12);
      hashedNewPassword = await bcrypt.hash(newPassword, 12);
      mockAuth.password = hashedOldPassword;
    });

    it('changes password when old password is valid', async () => {
      authRepo.findById.mockResolvedValue(mockAuth);
      authRepo.save.mockResolvedValue({
        ...mockAuth,
        password: hashedNewPassword,
      });

      const result = await usecase.execute(changePasswordDto);

      expect(authRepo.findById).toHaveBeenCalledWith(changePasswordDto.authId);
      const savedAuth = authRepo.save.mock.calls[0][0];
      expect(savedAuth.id).toBe(mockAuth.id);
      expect(savedAuth.password).not.toBe(hashedOldPassword);
      await expect(bcrypt.compare(newPassword, savedAuth.password)).resolves.toBe(true);
      expect(result).toEqual({ message: 'Password changed successfully' });
    });

    it('throws when user does not exist', async () => {
      authRepo.findById.mockResolvedValue(null);

      await expect(usecase.execute(changePasswordDto)).rejects.toThrow(NotFoundException);
      await expect(usecase.execute(changePasswordDto)).rejects.toThrow('User not found');
      expect(authRepo.save).not.toHaveBeenCalled();
    });

    it('throws when old password is invalid', async () => {
      authRepo.findById.mockResolvedValue(mockAuth);

      await expect(
        usecase.execute({
          ...changePasswordDto,
          oldPassword: 'wrongPassword',
        }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        usecase.execute({
          ...changePasswordDto,
          oldPassword: 'wrongPassword',
        }),
      ).rejects.toThrow('Invalid old password');
      expect(authRepo.save).not.toHaveBeenCalled();
    });
  });
});

