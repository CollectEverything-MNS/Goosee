import { Category } from 'src/entities/category.entity';

export abstract class ICategoryRepository {
  abstract save(category: Category): Promise<Category>;
  abstract findById(id: string): Promise<Category | null>;
  abstract list(): Promise<Category[]>;
  abstract listByParentId(parentId: string): Promise<Category[]>;
  abstract hasProducts(categoryId: string): Promise<boolean>;
  abstract softDelete(id: string): Promise<void>;
}
