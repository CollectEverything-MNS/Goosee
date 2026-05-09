import { ProductAttribute } from "../entities/product-attribute.entity";

export abstract class IProductAttributeRepository {
  abstract save(attribute: ProductAttribute): Promise<ProductAttribute>;
  abstract findById(id: string): Promise<ProductAttribute | null>;
  abstract listByProductId(productId: string): Promise<ProductAttribute[]>;
  abstract deleteById(id: string): Promise<void>;
}
