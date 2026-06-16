import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { MetricsController } from './metrics/metrics.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LogClient } from './shared/log-client.service';
import { Page } from './entities/page.entity';
import { Menu } from './entities/menu.entity';
import { SiteSettings } from './entities/site-settings.entity';
import { IPageRepository } from './repositories/page.repository';
import { TypeOrmPageRepository } from './repositories/implements/page.impl.repository';
import { IMenuRepository } from './repositories/menu.repository';
import { TypeOrmMenuRepository } from './repositories/implements/menu.impl.repository';
import { ISiteSettingsRepository } from './repositories/site-settings.repository';
import { TypeOrmSiteSettingsRepository } from './repositories/implements/site-settings.impl.repository';
import { CreatePageUseCase } from './usecases/create-page/create-page.usecase';
import { CreatePageController } from './usecases/create-page/create-page.controller';
import { UpdatePageUseCase } from './usecases/update-page/update-page.usecase';
import { UpdatePageController } from './usecases/update-page/update-page.controller';
import { DeletePageUseCase } from './usecases/delete-page/delete-page.usecase';
import { DeletePageController } from './usecases/delete-page/delete-page.controller';
import { GetPagesUseCase } from './usecases/get-pages/get-pages.usecase';
import { GetPagesController } from './usecases/get-pages/get-pages.controller';
import { GetPageUseCase } from './usecases/get-page/get-page.usecase';
import { GetPageController } from './usecases/get-page/get-page.controller';
import { GetPageBySlugUseCase } from './usecases/get-page-by-slug/get-page-by-slug.usecase';
import { GetPageBySlugController } from './usecases/get-page-by-slug/get-page-by-slug.controller';
import { SeedPagesUseCase } from './usecases/seed-pages/seed-pages.usecase';
import { SeedPagesController } from './usecases/seed-pages/seed-pages.controller';
import { GetMenusUseCase } from './usecases/get-menus/get-menus.usecase';
import { GetMenusController } from './usecases/get-menus/get-menus.controller';
import { CreateMenuUseCase } from './usecases/create-menu/create-menu.usecase';
import { CreateMenuController } from './usecases/create-menu/create-menu.controller';
import { UpdateMenuUseCase } from './usecases/update-menu/update-menu.usecase';
import { UpdateMenuController } from './usecases/update-menu/update-menu.controller';
import { DeleteMenuUseCase } from './usecases/delete-menu/delete-menu.usecase';
import { DeleteMenuController } from './usecases/delete-menu/delete-menu.controller';
import { ReorderMenusUseCase } from './usecases/reorder-menus/reorder-menus.usecase';
import { ReorderMenusController } from './usecases/reorder-menus/reorder-menus.controller';
import { GetSettingsUseCase } from './usecases/get-settings/get-settings.usecase';
import { GetSettingsController } from './usecases/get-settings/get-settings.controller';
import { UpdateSettingsUseCase } from './usecases/update-settings/update-settings.usecase';
import { UpdateSettingsController } from './usecases/update-settings/update-settings.controller';
import { StorageService } from './services/storage.service';
import { UploadFileUseCase } from './usecases/upload-file/upload-file.usecase';
import { UploadFileController } from './usecases/upload-file/upload-file.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('PAGE_DB_HOST'),
        port: configService.get<number>('PAGE_DB_PORT'),
        username: configService.get<string>('PAGE_DB_USER'),
        password: configService.get<string>('PAGE_DB_PASSWORD'),
        database: configService.get<string>('PAGE_DB_NAME'),
        entities: [Page, Menu, SiteSettings],
        migrations: ['dist/migrations/*.js'],
        migrationsRun: configService.get<string>('NODE_ENV') !== 'development',
        synchronize: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
    TypeOrmModule.forFeature([Page, Menu, SiteSettings]),
    ClientsModule.registerAsync([
      {
        name: 'LOG_CLIENT',
        inject: [ConfigService],
        useFactory: (cfg: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [cfg.get<string>('RABBITMQ_URL')!],
            queue: 'log_events',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [
    HealthController,
    MetricsController,
    CreatePageController,
    UpdatePageController,
    DeletePageController,
    GetPagesController,
    GetPageController,
    GetPageBySlugController,
    SeedPagesController,
    GetMenusController,
    CreateMenuController,
    UpdateMenuController,
    DeleteMenuController,
    ReorderMenusController,
    GetSettingsController,
    UpdateSettingsController,
    UploadFileController,
  ],
  providers: [
    {
      provide: IPageRepository,
      useClass: TypeOrmPageRepository,
    },
    {
      provide: IMenuRepository,
      useClass: TypeOrmMenuRepository,
    },
    {
      provide: ISiteSettingsRepository,
      useClass: TypeOrmSiteSettingsRepository,
    },
    CreatePageUseCase,
    UpdatePageUseCase,
    DeletePageUseCase,
    GetPagesUseCase,
    GetPageUseCase,
    GetPageBySlugUseCase,
    SeedPagesUseCase,
    GetMenusUseCase,
    CreateMenuUseCase,
    UpdateMenuUseCase,
    DeleteMenuUseCase,
    ReorderMenusUseCase,
    GetSettingsUseCase,
    UpdateSettingsUseCase,
    StorageService,
    UploadFileUseCase,
    LogClient,
  ],
})
export class AppModule {}
