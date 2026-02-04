import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './services/auth/auth.module';
import { PagesModule } from './services/pages/pages.module';
import { MenusModule } from './services/menus/menus.module';
import { SettingsModule } from './services/settings/settings.module';
import { UploadModule } from './services/upload/upload.module';
import { UserModule } from './services/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PagesModule,
    MenusModule,
    SettingsModule,
    UploadModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
