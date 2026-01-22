import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from './entities/page.entity';
import { IPageRepository } from './repositories/page.repository';
import { TypeOrmPageRepository } from './repositories/implements/page.impl.repository';
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
        entities: [Page],
        synchronize: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
    TypeOrmModule.forFeature([Page]),
  ],
  controllers: [
    CreatePageController,
    UpdatePageController,
    DeletePageController,
    GetPagesController,
    GetPageController,
    GetPageBySlugController,
    SeedPagesController,
  ],
  providers: [
    {
      provide: IPageRepository,
      useClass: TypeOrmPageRepository,
    },
    CreatePageUseCase,
    UpdatePageUseCase,
    DeletePageUseCase,
    GetPagesUseCase,
    GetPageUseCase,
    GetPageBySlugUseCase,
    SeedPagesUseCase,
  ],
})
export class AppModule {}
