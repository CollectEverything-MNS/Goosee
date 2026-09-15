import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SharedSecurityModule } from '../../shared/shared-security.module';
import { AdminRgpdController } from './admin-rgpd.controller';
import { RgpdService } from './rgpd.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({ timeout: 5000, maxRedirects: 5 }),
    SharedSecurityModule,
  ],
  controllers: [AdminRgpdController],
  providers: [RgpdService],
  exports: [RgpdService],
})
export class RgpdModule {}
