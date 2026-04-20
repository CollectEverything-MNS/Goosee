import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { Tag } from './entities/tag.entity';
import { ProductTag } from './entities/product-tag.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
import { LogClient } from './shared/log-client.service';

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
        entities: [Category, Product, ProductImage, Tag, ProductTag, ProductAttribute],
        synchronize: cfg.get<string>('NODE_ENV') === 'development',
      }),
    }),

    TypeOrmModule.forFeature([
      Category,
      Product,
      ProductImage,
      Tag,
      ProductTag,
      ProductAttribute,
    ]),

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
  providers: [LogClient],
})
export class AppModule {}