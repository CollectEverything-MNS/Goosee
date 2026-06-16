import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { InternalKpiController } from './internal-kpi.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [InternalKpiController],
})
export class InternalModule {}
