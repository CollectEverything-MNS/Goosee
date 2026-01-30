import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';
import { HttpProxyService } from '../../shared/services/http-proxy.service';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [PagesController],
  providers: [HttpProxyService, PagesService],
  exports: [PagesService],
})
export class PagesModule {}
