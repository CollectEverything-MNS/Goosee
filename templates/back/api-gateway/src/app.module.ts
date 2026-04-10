import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './services/auth/auth.module';
import { UserModule } from './services/user/user.module';
import { PagesModule } from './services/pages/pages.module';
import { UploadModule } from './services/upload/upload.module';
import { RolesModule } from './services/roles/roles.module';
import { SharedSecurityModule } from './shared/shared-security.module';

@Module({
  imports: [
    SharedSecurityModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    PagesModule,
    UploadModule,
    RolesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
