import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { HttpProxyService } from '../../shared/services/http-proxy.service';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [UploadController],
  providers: [HttpProxyService, UploadService],
  exports: [UploadService],
})
export class UploadModule {}
