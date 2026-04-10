import { Module } from '@nestjs/common';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';
import { SharedSecurityModule } from '../../shared/shared-security.module';

@Module({
  imports: [SharedSecurityModule],
  controllers: [PagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}

