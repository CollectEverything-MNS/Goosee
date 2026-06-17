import { Body, Controller, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { createHmac, timingSafeEqual } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { serviceUrl, ServiceUrls } from '../../../../config/services.config';

class SsoDto {
  @IsString()
  token: string;
}

/**
 * Auto-connexion (SSO) depuis la vitrine. Le jeton, signé HMAC par le control plane avec
 * l'INTERNAL_API_TOKEN du tenant, est vérifié ici (secret partagé) : on échange ensuite un
 * e-mail validé contre une vraie session, via l'endpoint interne de l'auth-service.
 */
@ApiTags('Auth')
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 10, ttl: 60000 } })
@Controller()
export class SsoController {
  private readonly services: ServiceUrls;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService
  ) {
    this.services = serviceUrl(this.config);
  }

  @Post('auth/sso')
  @ApiOperation({ summary: 'Auto-connexion via jeton SSO signé' })
  async sso(@Body() dto: SsoDto) {
    const email = this.verify(dto.token);
    const internalToken = this.config.get<string>('INTERNAL_API_TOKEN');
    const res = await firstValueFrom(
      this.http.post(
        `${this.services.auth}/internal/issue-session`,
        { email },
        { headers: { 'x-internal-token': internalToken } }
      )
    );
    return res.data;
  }

  // Vérifie la signature HMAC + l'expiration et renvoie l'e-mail du payload.
  private verify(token: string): string {
    const secret = this.config.get<string>('INTERNAL_API_TOKEN');
    if (!secret) throw new UnauthorizedException('SSO non configuré');

    const [payload, sig] = (token ?? '').split('.');
    if (!payload || !sig) throw new UnauthorizedException('Jeton SSO invalide');

    const expected = createHmac('sha256', secret).update(payload).digest('base64url');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Signature SSO invalide');
    }

    let data: { email?: string; exp?: number };
    try {
      data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    } catch {
      throw new UnauthorizedException('Jeton SSO illisible');
    }
    if (!data.email || !data.exp || Date.now() > data.exp) {
      throw new UnauthorizedException('Jeton SSO expiré');
    }
    return data.email;
  }
}
