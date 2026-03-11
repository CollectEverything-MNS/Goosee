import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { AuthToken, AUTH_TOKEN_TYPES } from '../../entities/auth-token.entity';
import { Auth } from '../../entities/auth.entity';
import { IAuthRepository } from '../../repositories/auth.repository';
import { IAuthTokenRepository } from '../../repositories/auth-token.repository';

@Injectable()
export class ResendVerificationEmailUseCase {
  constructor(
    private readonly authRepo: IAuthRepository,
    private readonly authTokenRepo: IAuthTokenRepository,
    private readonly config: ConfigService,
    @Inject('RMQ_NOTIF_CLIENT') private rmqNotif: ClientProxy
  ) {}

  async execute(email: string): Promise<{ message: string }> {
    const baseUrl = this.getBaseUrl();
    const auth = await this.authRepo.findByEmail(email);
    if (!auth) {
      throw new NotFoundException('User not found');
    }

    return this.resendForAuth(auth, baseUrl);
  }

  private async resendForAuth(auth: Auth, baseUrl: string): Promise<{ message: string }> {
    if (auth.isVerified) {
      return { message: 'Email already verified' };
    }

    const tokens = await this.authTokenRepo.findByAuthId(auth.id);
    const verificationTokens = tokens.filter(
      (token) => token.type === AUTH_TOKEN_TYPES.emailVerification
    );

    for (const token of verificationTokens) {
      await this.authTokenRepo.deleteByToken(token.token);
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await this.authTokenRepo.save(
      new AuthToken({
        authId: auth.id,
        token: verificationToken,
        type: AUTH_TOKEN_TYPES.emailVerification,
        expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      })
    );

    const verificationUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`;

    await lastValueFrom(
      this.rmqNotif.emit('send_notification', {
        type: 'EMAIL',
        data: {
          to: auth.email,
          subject: 'Vérification de votre compte',
          html: `<p>Bienvenue !</p><p>Merci de vérifier votre compte en cliquant sur le lien ci-dessous :</p><p><a href="${verificationUrl}">Vérifier mon compte</a></p><p>Ce lien expire dans 24 heures.</p>`,
        },
      })
    );

    return { message: 'Verification email sent' };
  }

  private getBaseUrl(): string {
    const baseUrl = this.config.get<string>('NEXT_PUBLIC_API_URL');
    if (!baseUrl) {
      throw new InternalServerErrorException('NEXT_PUBLIC_API_URL is not defined');
    }
    return baseUrl;
  }
}
