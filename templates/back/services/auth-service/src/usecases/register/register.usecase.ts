import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Auth } from '../../entities/auth.entity';
import { AuthToken, AUTH_TOKEN_TYPES } from '../../entities/auth-token.entity';
import { IAuthRepository } from '../../repositories/auth.repository';
import { IAuthTokenRepository } from '../../repositories/auth-token.repository';
import { RegisterDto, RegisterResponseDto } from './register.dto';
import { hashPassword } from '../../shared/utils';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly authRepo: IAuthRepository,
    private readonly authTokenRepo: IAuthTokenRepository,
    private readonly config: ConfigService,
    @Inject('RMQ_NOTIF_CLIENT') private rmqNotif: ClientProxy,
    @Inject('RMQ_AUTH_CLIENT') private rmqAuth: ClientProxy
  ) {}

  async execute(dto: RegisterDto): Promise<RegisterResponseDto> {
    const baseUrl = this.config.get<string>('NEXT_PUBLIC_API_URL');
    if (!baseUrl) {
      throw new InternalServerErrorException('NEXT_PUBLIC_API_URL is not defined');
    }

    const existingAuth = await this.authRepo.findByEmail(dto.email);

    if (existingAuth) {
      if (existingAuth.isVerified) {
        throw new ConflictException('Email already exists');
      }

      const verificationToken = await this.generateAndPersistVerificationToken(existingAuth.id);
      await this.sendVerificationEmail(existingAuth.email, verificationToken, baseUrl);

      return {
        id: existingAuth.id,
        email: existingAuth.email,
        createdAt: existingAuth.createdAt,
      };
    }

    const hashedPassword = await hashPassword(dto.password);

    const auth = new Auth({
      email: dto.email,
      password: hashedPassword,
    });

    const savedAuth = await this.authRepo.save(auth);

    const verificationToken = await this.generateAndPersistVerificationToken(savedAuth.id);
    await this.sendVerificationEmail(savedAuth.email, verificationToken, baseUrl);

    await lastValueFrom(
      this.rmqAuth.emit('auth.registered', {
        authId: savedAuth.id,
        email: savedAuth.email,
        firstName: dto.firstName || '',
        lastName: dto.lastName || '',
      })
    );

    return {
      id: savedAuth.id,
      email: savedAuth.email,
      createdAt: savedAuth.createdAt,
    };
  }

  private async generateAndPersistVerificationToken(authId: string): Promise<string> {
    const tokens = await this.authTokenRepo.findByAuthId(authId);
    const verificationTokens = tokens.filter(
      (token) => token.type === AUTH_TOKEN_TYPES.emailVerification
    );

    for (const token of verificationTokens) {
      await this.authTokenRepo.deleteByToken(token.token);
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiredAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await this.authTokenRepo.save(
      new AuthToken({
        authId,
        token: verificationToken,
        type: AUTH_TOKEN_TYPES.emailVerification,
        expiredAt: verificationExpiredAt,
      })
    );

    return verificationToken;
  }

  private async sendVerificationEmail(
    email: string,
    verificationToken: string,
    baseUrl: string
  ): Promise<void> {
    const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`;

    await lastValueFrom(
      this.rmqNotif.emit('send_notification', {
        type: 'EMAIL',
        data: {
          to: email,
          subject: 'Vérification de votre compte',
          html: `<p>Bienvenue !</p><p>Merci de vérifier votre compte en cliquant sur le lien ci-dessous :</p><p><a href="${verificationUrl}">Vérifier mon compte</a></p><p>Ce lien expire dans 24 heures.</p>`,
        },
      })
    );
  }
}
