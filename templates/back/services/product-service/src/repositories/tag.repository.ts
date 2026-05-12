import { Tag } from "../entities/tag.entity";

export abstract class ITagRepository {
  abstract save(tag: Tag): Promise<Tag>;
  abstract findById(id: string): Promise<Tag | null>;
  abstract findBySlug(slug: string): Promise<Tag | null>;
  abstract list(): Promise<Tag[]>;
  abstract findByProductId(productId: string): Promise<Tag[]>;
  abstract deleteById(id: string): Promise<void>;
}
