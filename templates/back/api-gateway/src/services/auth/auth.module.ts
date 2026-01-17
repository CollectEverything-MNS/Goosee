import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { LoginController } from './usecases/login/login.controller';
import { LoginService } from './usecases/login/login.service';
import { RegisterController } from './usecases/register/register.controller';
import { RegisterService } from './usecases/register/register.service';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [LoginController, RegisterController],
  providers: [LoginService, RegisterService],
  exports: [LoginService, RegisterService],
})
export class AuthModule {}
