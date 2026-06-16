import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { MetricsController } from './metrics/metrics.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MulterModule } from '@nestjs/platform-express';

import { LogClient } from './services/log-client.service';
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
import { CreateCategoryController } from './usecases/create-category/create-category.controller';
import { CreateCategoryUseCase } from './usecases/create-category/create-category.usecase';
import { DeleteCategoryController } from './usecases/delete-category/delete-category.controller';
import { DeleteCategoryUseCase } from './usecases/delete-category/delete-category.usecase';
import { GetCategoryController } from './usecases/get-category/get-category.controller';
import { GetCategoryUseCase } from './usecases/get-category/get-category.usecase';
import { ListCategoriesController } from './usecases/list-categories/list-categories.controller';
import { ListCategoriesUseCase } from './usecases/list-categories/list-categories.usecase';
import { UpdateCategoryController } from './usecases/update-category/update-category.controller';
import { UpdateCategoryUseCase } from './usecases/update-category/update-category.usecase';
import { CreateProductController } from './usecases/create-product/create-product.controller';
import { CreateProductUseCase } from './usecases/create-product/create-product.usecase';
import { DeleteProductController } from './usecases/delete-product/delete-product.controller';
import { DeleteProductUseCase } from './usecases/delete-product/delete-product.usecase';
import { GetProductController } from './usecases/get-product/get-product.controller';
import { GetProductUseCase } from './usecases/get-product/get-product.usecase';
import { ListProductsByCategoryController } from './usecases/list-products-by-category/list-products-by-category.controller';
import { ListProductsByCategoryUseCase } from './usecases/list-products-by-category/list-products-by-category.usecase';
import { ListProductsController } from './usecases/list-products/list-products.controller';
import { ListProductsUseCase } from './usecases/list-products/list-products.usecase';
import { UpdateProductStockController } from './usecases/update-product-stock/update-product-stock.controller';
import { UpdateProductStockUseCase } from './usecases/update-product-stock/update-product-stock.usecase';
import { UpdateProductController } from './usecases/update-product/update-product.controller';
import { UpdateProductUseCase } from './usecases/update-product/update-product.usecase';
import { StorageService } from './services/storage.service';
import { AddProductImageController } from './usecases/add-product-image/add-product-image.controller';
import { AddProductImageUseCase } from './usecases/add-product-image/add-product-image.usecase';
import { DeleteProductImageController } from './usecases/delete-product-image/delete-product-image.controller';
import { DeleteProductImageUseCase } from './usecases/delete-product-image/delete-product-image.usecase';
import { GetProductImagesController } from './usecases/get-product-images/get-product-images.controller';
import { GetProductImagesUseCase } from './usecases/get-product-images/get-product-images.usecase';
import { SetMainProductImageController } from './usecases/set-main-product-image/set-main-product-image.controller';
import { SetMainProductImageUseCase } from './usecases/set-main-product-image/set-main-product-image.usecase';
import { AddProductAttributeController } from './usecases/add-product-attribute/add-product-attribute.controller';
import { AddProductAttributeUseCase } from './usecases/add-product-attribute/add-product-attribute.usecase';
import { AddProductTagController } from './usecases/add-product-tag/add-product-tag.controller';
import { AddProductTagUseCase } from './usecases/add-product-tag/add-product-tag.usecase';
import { CreateTagController } from './usecases/create-tag/create-tag.controller';
import { CreateTagUseCase } from './usecases/create-tag/create-tag.usecase';
import { deleteProductAttributeController } from './usecases/delete-product-attribute/delete-product-attribute.controller';
import { deleteProductAttributeUseCase } from './usecases/delete-product-attribute/delete-product-attribute.usecase';
import { deleteProductTagController } from './usecases/delete-product-tag/delete-product-tag.controller';
import { deleteProductTagUseCase } from './usecases/delete-product-tag/delete-product-tag.usecase';
import { DeleteTagController } from './usecases/delete-tag/delete-tag.controller';
import { DeleteTagUseCase } from './usecases/delete-tag/delete-tag.usecase';
import { ListProductAttributesController } from './usecases/list-product-attributes/list-product-attributes.controller';
import { ListProductAttributesUseCase } from './usecases/list-product-attributes/list-product-attributes.usecase';
import { ListProductTagsController } from './usecases/list-product-tags/list-product-tags.controller';
import { ListProductTagsUseCase } from './usecases/list-product-tags/list-product-tags.usecase';
import { ListTagsController } from './usecases/list-tags/list-tags.controller';
import { ListTagsUseCase } from './usecases/list-tags/list-tags.usecase';
import { GetProductAttributeController } from './usecases/get-product-attribute/get-product-attribute.controller';
import { GetProductAttributeUseCase } from './usecases/get-product-attribute/get-product-attribute.usecase';
import { GetTagController } from './usecases/get-tag/get-tag.controller';
import { GetTagUseCase } from './usecases/get-tag/get-tag.usecase';
import { ProductSeederService } from './shared/product-seeder.service';

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
        migrations: ['dist/migrations/*.js'],
        migrationsRun: cfg.get<string>('NODE_ENV') !== 'development',
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
            urls: [cfg.get<string>('RABBITMQ_URL')!],
            queue: 'log_events',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
    MulterModule.register({ storage: undefined }),
  ],
  controllers: [
    HealthController,
    MetricsController,
    CreateCategoryController,
    UpdateCategoryController,
    DeleteCategoryController,
    GetCategoryController,
    ListCategoriesController,
    CreateProductController,
    UpdateProductController,
    DeleteProductController,
    GetProductController,
    ListProductsController,
    ListProductsByCategoryController,
    UpdateProductStockController,
    GetProductImagesController,
    AddProductImageController,
    DeleteProductImageController,
    SetMainProductImageController,
    CreateTagController,
    ListTagsController,
    DeleteTagController,
    AddProductTagController,
    ListProductTagsController,
    deleteProductTagController,
    AddProductAttributeController,
    ListProductAttributesController,
    deleteProductAttributeController,
    GetTagController,
    GetProductAttributeController,
  ],
  providers: [
    { provide: ICategoryRepository, useClass: TypeOrmCategoryRepository },
    { provide: IProductRepository, useClass: TypeOrmProductRepository },
    { provide: IProductImageRepository, useClass: TypeOrmProductImageRepository },
    { provide: ITagRepository, useClass: TypeOrmTagRepository },
    { provide: IProductTagRepository, useClass: TypeOrmProductTagRepository },
    { provide: IProductAttributeRepository, useClass: TypeOrmProductAttributeRepository },
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    GetCategoryUseCase,
    ListCategoriesUseCase,
    LogClient,
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    GetProductUseCase,
    ListProductsUseCase,
    ListProductsByCategoryUseCase,
    UpdateProductStockUseCase,
    StorageService,
    GetProductImagesUseCase,
    AddProductImageUseCase,
    DeleteProductImageUseCase,
    SetMainProductImageUseCase,
    CreateTagUseCase,
    ListTagsUseCase,
    DeleteTagUseCase,
    AddProductTagUseCase,
    ListProductTagsUseCase,
    deleteProductTagUseCase,
    AddProductAttributeUseCase,
    ListProductAttributesUseCase,
    deleteProductAttributeUseCase,
    GetTagUseCase,
    GetProductAttributeUseCase,
    ProductSeederService,
  ],
})
export class AppModule {}
