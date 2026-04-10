import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  token: string;
}

export class RefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiredAt: Date;
  refreshTokenExpiredAt: Date;
}
