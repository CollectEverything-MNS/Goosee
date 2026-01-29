import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { HttpProxyService } from '../../shared/services/http-proxy.service';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [SettingsController],
  providers: [HttpProxyService, SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
