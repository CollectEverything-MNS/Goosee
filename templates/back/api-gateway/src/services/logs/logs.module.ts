import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { HttpProxyService } from '../../shared/services/http-proxy.service';
import { ListLogsController } from './usecases/list-logs/list-logs.controller';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [ListLogsController],
  providers: [HttpProxyService],
  exports: [],
})
export class LogsModule {}
