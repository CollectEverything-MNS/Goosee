import { Product } from "../entities/product.entity";

export abstract class IProductRepository {
  abstract save(product: Product): Promise<Product>;
  abstract findById(id: string): Promise<Product | null>;
  abstract list(): Promise<Product[]>;
  abstract listByCategoryId(categoryId: string): Promise<Product[]>;
  abstract countByCategoryId(categoryId: string): Promise<number>;
  abstract softDelete(id: string): Promise<void>;
}
