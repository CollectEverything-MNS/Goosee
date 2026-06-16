import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './services/auth/auth.module';
import { UserModule } from './services/user/user.module';
import { PagesModule } from './services/pages/pages.module';
import { UploadModule } from './services/upload/upload.module';
import { RolesModule } from './services/roles/roles.module';
import { SharedSecurityModule } from './shared/shared-security.module';
import { CategoriesModule } from './services/categories/categories.module';
import { ProductsModule } from './services/products/products.module';
import { TagsModule } from './services/tags/tags.module';
import { LogsModule } from './services/logs/logs.module';

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
    ProductsModule,
    CategoriesModule,
    TagsModule,
    LogsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
