import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../entities/product-image.entity';
import { Tag } from '../entities/tag.entity';
import { ProductTag } from '../entities/product-tag.entity';
import { ProductAttribute } from '../entities/product-attribute.entity';

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('PRODUCT_DB_HOST'),
  port: configService.get<number>('PRODUCT_DB_PORT'),
  username: configService.get<string>('PRODUCT_DB_USER'),
  password: configService.get<string>('PRODUCT_DB_PASSWORD'),
  database: configService.get<string>('PRODUCT_DB_NAME'),
  entities: [Category, Product, ProductImage, Tag, ProductTag, ProductAttribute],
  migrations: ['src/migrations/*.ts'],
  synchronize: configService.get<string>('NODE_ENV') === 'development',
});