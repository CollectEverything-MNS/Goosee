import { Module } from '@nestjs/common';
import { SharedSecurityModule } from '../../shared/shared-security.module';
import { MulterModule } from '@nestjs/platform-express';
import { AddProductAttributeController } from './add-product-attribute/add-product-attribute.controller';
import { DeleteProductAttributeController } from './delete-product-attribute/delete-product-attribute.controller';
import { AddProductImageController } from './usecases/add-product-image/add-product-image.controller';
import { AddProductTagController } from './usecases/add-product-tag/add-product-tag.controller';
import { CreateProductController } from './usecases/create-product/create-product.controller';
import { DeleteProductImageController } from './usecases/delete-product-image/delete-product-image.controller';
import { DeleteProductTagController } from './usecases/delete-product-tag/delete-product-tag.controller';
import { DeleteProductController } from './usecases/delete-product/delete-product.controller';
import { GetProductAttributeController } from './usecases/get-product-attribute/get-product-attribute.controller';
import { GetProductImagesController } from './usecases/get-product-images/get-product-images.controller';
import { GetProductController } from './usecases/get-product/get-product.controller';
import { ListProductAttributesController } from './usecases/list-product-attributes/list-product-attributes.controller';
import { ListProductTagsController } from './usecases/list-product-tags/list-product-tags.controller';
import { ListProductsController } from './usecases/list-products/list-products.controller';
import { SetMainProductImageController } from './usecases/set-main-product-image/set-main-product-image.controller';
import { UpdateProductController } from './usecases/update-product/update-product.controller';

@Module({
  imports: [SharedSecurityModule, MulterModule.register({ storage: undefined })],
  controllers: [
    ListProductsController,
    GetProductController,
    CreateProductController,
    UpdateProductController,
    DeleteProductController,
    GetProductImagesController,
    AddProductImageController,
    DeleteProductImageController,
    SetMainProductImageController,
    ListProductTagsController,
    AddProductTagController,
    DeleteProductTagController,
    ListProductAttributesController,
    GetProductAttributeController,
    AddProductAttributeController,
    DeleteProductAttributeController,
  ],
})
export class ProductsModule {}
