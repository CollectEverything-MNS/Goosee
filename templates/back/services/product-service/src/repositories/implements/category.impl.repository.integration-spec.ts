import { DataSource } from 'typeorm';
import { createTestDataSource, clearDatabase } from '../../test-utils/test-data-source';
import { TypeOrmCategoryRepository } from './category.impl.repository';
import { Category } from '../../entities/category.entity';

describe('TypeOrmCategoryRepository (integration)', () => {
  let dataSource: DataSource;
  let repo: TypeOrmCategoryRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    repo = new TypeOrmCategoryRepository(dataSource.getRepository(Category));
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);
  });

  const newCategory = (overrides: Partial<Category> = {}) =>
    new Category({ name: 'Vins', order: 0, isActive: true, ...overrides });

  it('devrait persister une catégorie et générer id/createdAt/updatedAt', async () => {
    const saved = await repo.save(newCategory());

    expect(saved.id).toBeDefined();
    expect(saved.createdAt).toBeInstanceOf(Date);
    expect(saved.updatedAt).toBeInstanceOf(Date);
  });

  it('findById devrait retourner null pour un id inexistant', async () => {
    expect(await repo.findById('00000000-0000-0000-0000-000000000000')).toBeNull();
  });

  it('softDelete devrait exclure la catégorie des lectures suivantes', async () => {
    const saved = await repo.save(newCategory());

    await repo.softDelete(saved.id);

    expect(await repo.findById(saved.id)).toBeNull();
    expect(await repo.list()).toHaveLength(0);
  });

  it('list devrait trier par order ASC', async () => {
    const second = await repo.save(newCategory({ name: 'Bières', order: 1 }));
    const first = await repo.save(newCategory({ name: 'Vins', order: 0 }));

    const result = await repo.list();

    expect(result.map((c) => c.id)).toEqual([first.id, second.id]);
  });

  it('listByParentId devrait retourner les enfants directs', async () => {
    const parent = await repo.save(newCategory({ name: 'Vins' }));
    const child = await repo.save(newCategory({ name: 'Vins Rouges', parentId: parent.id }));
    await repo.save(newCategory({ name: 'Autre' }));

    const result = await repo.listByParentId(parent.id);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(child.id);
  });
});
