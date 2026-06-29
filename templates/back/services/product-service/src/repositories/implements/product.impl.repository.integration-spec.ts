import { DataSource } from 'typeorm';
import { createTestDataSource, clearDatabase } from '../../test-utils/test-data-source';
import { TypeOrmProductRepository } from './product.impl.repository';
import { Product } from '../../entities/product.entity';

describe('TypeOrmProductRepository (integration)', () => {
  let dataSource: DataSource;
  let repo: TypeOrmProductRepository;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    repo = new TypeOrmProductRepository(dataSource.getRepository(Product));
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);
  });

  const newProduct = (overrides: Partial<Product> = {}) =>
    new Product({
      name: 'Pizza',
      description: 'Pizza margherita',
      price: 10,
      stock: 5,
      preparationTime: 0,
      isAvailable: true,
      categoryId: 'category-1',
      ...overrides,
    });

  it('devrait persister un produit et générer id/createdAt/updatedAt', async () => {
    const saved = await repo.save(newProduct());

    expect(saved.id).toBeDefined();
    expect(saved.createdAt).toBeInstanceOf(Date);
    expect(saved.updatedAt).toBeInstanceOf(Date);
  });

  it('findById devrait retourner null pour un id inexistant', async () => {
    const result = await repo.findById('00000000-0000-0000-0000-000000000000');

    expect(result).toBeNull();
  });

  it('softDelete devrait exclure le produit des lectures suivantes', async () => {
    const saved = await repo.save(newProduct());

    await repo.softDelete(saved.id);

    expect(await repo.findById(saved.id)).toBeNull();
    expect(await repo.list()).toHaveLength(0);
  });

  it('list devrait retourner les produits triés par createdAt DESC', async () => {
    const first = await repo.save(newProduct({ name: 'Premier' }));
    await new Promise((resolve) => setTimeout(resolve, 10));
    const second = await repo.save(newProduct({ name: 'Second' }));

    const result = await repo.list();

    expect(result.map((p) => p.id)).toEqual([second.id, first.id]);
  });

  it('listByCategoryId devrait filtrer par catégorie', async () => {
    await repo.save(newProduct({ categoryId: 'category-1' }));
    const matching = await repo.save(newProduct({ categoryId: 'category-2' }));

    const result = await repo.listByCategoryId('category-2');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(matching.id);
  });

  it('countByCategoryId devrait compter uniquement les produits actifs de la catégorie', async () => {
    const toDelete = await repo.save(newProduct({ categoryId: 'category-1' }));
    await repo.save(newProduct({ categoryId: 'category-1' }));
    await repo.softDelete(toDelete.id);

    const count = await repo.countByCategoryId('category-1');

    expect(count).toBe(1);
  });
});
