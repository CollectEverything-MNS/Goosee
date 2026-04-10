import { Module } from '@nestjs/common';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';
import { SharedSecurityModule } from '../../shared/shared-security.module';

@Module({
  imports: [SharedSecurityModule],
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}

