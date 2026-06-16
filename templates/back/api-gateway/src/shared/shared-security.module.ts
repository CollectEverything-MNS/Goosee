import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { HttpProxyService } from './services/http-proxy.service';
import { JwtAuthGuard } from './services/jwt-auth.guard';
import { RolesGuard } from './services/roles.guard';
import { RoleAccessService } from './services/role-access.service';

@Global()
@Module({
  imports: [ConfigModule, HttpModule.register({ timeout: 5000, maxRedirects: 5 })],
  providers: [HttpProxyService, JwtAuthGuard, RolesGuard, RoleAccessService],
  exports: [HttpProxyService, JwtAuthGuard, RolesGuard, RoleAccessService],
})
export class SharedSecurityModule {}
