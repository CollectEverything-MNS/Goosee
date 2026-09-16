import { DataSource, QueryRunner } from 'typeorm';
import { createTestDataSource } from '../test-utils/test-data-source';
import { Init1781634833348 } from './1781634833348-Init';
import { FixProductTagUuidColumns1782200000000 } from './1782200000000-FixProductTagUuidColumns';

describe('Product tag UUID migration (PostgreSQL)', () => {
  let dataSource: DataSource;
  let runner: QueryRunner;

  beforeAll(async () => {
    dataSource = await createTestDataSource();
    runner = dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    await runner.query('CREATE SCHEMA product_tag_migration_test');
    await runner.query('SET LOCAL search_path TO product_tag_migration_test, public');
    await new Init1781634833348().up(runner);
  });

  afterAll(async () => {
    if (runner?.isTransactionActive) await runner.rollbackTransaction();
    if (runner) await runner.release();
    if (dataSource?.isInitialized) await dataSource.destroy();
  });

  it('upgrades the initial schema without losing links and supports rollback', async () => {
    const productId = '11111111-1111-4111-8111-111111111111';
    const tagId = '22222222-2222-4222-8222-222222222222';
    await runner.query('INSERT INTO tag (id, name, slug) VALUES ($1, $2, $3)', [
      tagId, 'Bio', 'bio',
    ]);
    await runner.query('INSERT INTO product_tag ("productId", "tagId") VALUES ($1, $2)', [
      productId, tagId,
    ]);

    const migration = new FixProductTagUuidColumns1782200000000();
    await migration.up(runner);
    const tags = await runner.query(`
      SELECT tag.id, tag.name FROM tag
      INNER JOIN product_tag pt ON pt."tagId" = tag.id
      WHERE pt."productId" = $1
    `, [productId]);
    expect(tags).toEqual([{ id: tagId, name: 'Bio' }]);

    await migration.down(runner);
    const links = await runner.query(`
      SELECT "productId", "tagId", pg_typeof("tagId")::text AS type FROM product_tag
    `);
    expect(links).toEqual([{ productId, tagId, type: 'character varying' }]);
  });
});
