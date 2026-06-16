import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { InternalKpiController } from './internal-kpi.controller';

@Module({
  imports: [HttpModule.register({ timeout: 5000, maxRedirects: 5 }), ConfigModule],
  controllers: [InternalKpiController],
})
export class InternalModule {}
