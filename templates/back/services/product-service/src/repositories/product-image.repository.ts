import { ProductImage } from "../entities/product-image.entity";

export abstract class IProductImageRepository {
  abstract save(image: ProductImage): Promise<ProductImage>;
  abstract findById(id: string): Promise<ProductImage | null>;
  abstract listByProductId(productId: string): Promise<ProductImage[]>;
  abstract listByProductIds(productIds: string[]): Promise<ProductImage[]>;
  abstract clearMainByProductId(productId: string): Promise<void>;
  abstract deleteById(id: string): Promise<void>;
}
