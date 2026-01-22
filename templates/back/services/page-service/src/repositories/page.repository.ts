import { Page } from '../entities/page.entity';

export abstract class IPageRepository {
  abstract create(page: Partial<Page>): Promise<Page>;
  abstract findAll(): Promise<Page[]>;
  abstract findById(id: string): Promise<Page | null>;
  abstract findBySlug(slug: string): Promise<Page | null>;
  abstract update(id: string, page: Partial<Page>): Promise<Page | null>;
  abstract delete(id: string): Promise<void>;
}
