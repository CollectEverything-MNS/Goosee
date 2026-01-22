import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { LoginController } from './usecases/login/login.controller';
import { RegisterController } from './usecases/register/register.controller';
import { RevokeTokenController } from './usecases/revoke-token/revoke-token.controller';
import { RefreshTokenController } from './usecases/refresh-token/refresh-token.controller';
import { ChangePasswordController } from './usecases/change-password/change-password.controller';
import { ForgetPasswordRequestController } from './usecases/forget-password-request/forget-password-request.controller';
import { ForgetPasswordConfirmController } from './usecases/forget-password-confirm/forget-password-confirm.controller';
import { HttpProxyService } from '../../shared/services/http-proxy.service';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [
    LoginController,
    RegisterController,
    RevokeTokenController,
    RefreshTokenController,
    ChangePasswordController,
    ForgetPasswordRequestController,
    ForgetPasswordConfirmController,
  ],
  providers: [
    HttpProxyService,
  ],
  exports: [
  ],
})
export class AuthModule {}
