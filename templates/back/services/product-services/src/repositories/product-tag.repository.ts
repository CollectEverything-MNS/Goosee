import { ProductTag } from 'src/entities/product-tag.entity';

export abstract class IProductTagRepository {
  abstract save(productTag: ProductTag): Promise<ProductTag>;
  abstract findByProductId(productId: string): Promise<ProductTag[]>;
  abstract findOne(productId: string, tagId: string): Promise<ProductTag | null>;
  abstract delete(productId: string, tagId: string): Promise<void>;
}
