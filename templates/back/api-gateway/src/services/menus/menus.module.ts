import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';
import { HttpProxyService } from '../../shared/services/http-proxy.service';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [MenusController],
  providers: [HttpProxyService, MenusService],
  exports: [MenusService],
})
export class MenusModule {}
