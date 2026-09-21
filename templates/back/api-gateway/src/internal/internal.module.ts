import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { InternalKpiController } from './internal-kpi.controller';
import { InternalLogsController } from './internal-logs.controller';
import { RgpdController } from './rgpd.controller';
import { RgpdModule } from '../services/rgpd/rgpd.module';

@Module({
  imports: [HttpModule.register({ timeout: 5000, maxRedirects: 5 }), ConfigModule, RgpdModule],
  controllers: [InternalKpiController, InternalLogsController, RgpdController],
})
export class InternalModule {}
