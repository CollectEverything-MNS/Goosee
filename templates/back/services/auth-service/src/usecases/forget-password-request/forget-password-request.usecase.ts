import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { IAuthRepository } from '../../repositories/auth.repository';
import { IAuthTokenRepository } from '../../repositories/auth-token.repository';
import { AuthToken, AUTH_TOKEN_TYPES } from '../../entities/auth-token.entity';
import * as crypto from 'crypto';

@Injectable()
export class ForgetPasswordRequestUseCase {
  constructor(
    private readonly authRepo: IAuthRepository,
    private readonly tokenRepo: IAuthTokenRepository,
    @Inject('RMQ_NOTIF_CLIENT') private rmq: ClientProxy
  ) {}

  async execute(email: string) {
    const auth = await this.authRepo.findByEmail(email);

    if (!auth) {
      throw new NotFoundException('User not found');
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    await this.tokenRepo.save(
      new AuthToken({
        authId: auth.id,
        token: `OTP_${otp}`,
        type: AUTH_TOKEN_TYPES.passwordReset,
        expiredAt: new Date(Date.now() + 1000 * 60 * 10), // 10 min
      })
    );

    await lastValueFrom(
      this.rmq.emit('send_notification', {
        type: 'EMAIL',
        data: {
          to: email,
          subject: 'Code de réinitialisation de mot de passe',
          html: `<p>Votre code de réinitialisation de mot de passe est : <b>${otp}</b></p><p>Ce code est valide pendant 10 minutes.</p>`,
        },
      })
    );

    return {
      message: 'OTP sent to email (Regarder dans RABBITMQ dans les message dans le queue)',
    };
  }
}
