import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { LogClient } from './shared/log-client.service';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { Tag } from './entities/tag.entity';
import { ProductTag } from './entities/product-tag.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
import { ICategoryRepository } from './repositories/category.repository';
import { TypeOrmCategoryRepository } from './repositories/implements/category.impl.repository';
import { TypeOrmProductAttributeRepository } from './repositories/implements/product-attribute.impl.repository';
import { TypeOrmProductImageRepository } from './repositories/implements/product-image.impl.repository';
import { TypeOrmProductTagRepository } from './repositories/implements/product-tag.impl.repository';
import { TypeOrmProductRepository } from './repositories/implements/product.impl.repository';
import { TypeOrmTagRepository } from './repositories/implements/tag.impl.repository';
import { IProductAttributeRepository } from './repositories/product-attribute.repository';
import { IProductImageRepository } from './repositories/product-image.repository';
import { IProductTagRepository } from './repositories/product-tag.repository';
import { IProductRepository } from './repositories/product.repository';
import { ITagRepository } from './repositories/tag.repository';

const ENTITIES = [Category, Product, ProductImage, Tag, ProductTag, ProductAttribute];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get<string>('PRODUCT_DB_HOST'),
        port: cfg.get<number>('PRODUCT_DB_PORT'),
        username: cfg.get<string>('PRODUCT_DB_USER'),
        password: cfg.get<string>('PRODUCT_DB_PASSWORD'),
        database: cfg.get<string>('PRODUCT_DB_NAME'),
        entities: ENTITIES,
        synchronize: cfg.get<string>('NODE_ENV') === 'development',
      }),
    }),

    TypeOrmModule.forFeature(ENTITIES),

    ClientsModule.registerAsync([
      {
        name: 'LOG_CLIENT',
        inject: [ConfigService],
        useFactory: (cfg: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [cfg.get<string>('RABBITMQ_URL')],
            queue: 'log_events',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [],
    providers: [
    { provide: ICategoryRepository, useClass: TypeOrmCategoryRepository },
    { provide: IProductRepository, useClass: TypeOrmProductRepository },
    { provide: IProductImageRepository, useClass: TypeOrmProductImageRepository },
    { provide: ITagRepository, useClass: TypeOrmTagRepository },
    { provide: IProductTagRepository, useClass: TypeOrmProductTagRepository },
    { provide: IProductAttributeRepository, useClass: TypeOrmProductAttributeRepository },
    LogClient,
    ],
})
export class AppModule {}