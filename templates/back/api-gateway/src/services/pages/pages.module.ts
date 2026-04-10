import { Module } from '@nestjs/common';
import { PagesController } from './pages.controller';
import { MenusController } from './menus.controller';
import { SettingsController } from './settings.controller';
import { PagesService } from './pages.service';
import { SharedSecurityModule } from '../../shared/shared-security.module';

@Module({
  imports: [SharedSecurityModule],
  controllers: [PagesController, MenusController, SettingsController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
