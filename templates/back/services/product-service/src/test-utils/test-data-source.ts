import { DataSource } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../entities/product-image.entity';
import { Tag } from '../entities/tag.entity';
import { ProductTag } from '../entities/product-tag.entity';
import { ProductAttribute } from '../entities/product-attribute.entity';

const ENTITIES = [Category, Product, ProductImage, Tag, ProductTag, ProductAttribute];

/**
 * Refuses to run against anything that isn't obviously a disposable test database.
 * This is the last line of defense against a misconfigured env file pointing
 * synchronize/TRUNCATE at the real dev database (PRODUCT_DB_NAME=product_db).
 */
export function assertIsTestDatabase(databaseName: string | undefined): void {
  if (!databaseName || !databaseName.toLowerCase().includes('test')) {
    throw new Error(
      `Refusing to run tests against database "${databaseName}" — its name must contain "test" ` +
        '(e.g. product_db_test). Check PRODUCT_DB_NAME in env/.env.test.',
    );
  }
}

export async function createTestDataSource(): Promise<DataSource> {
  assertIsTestDatabase(process.env.PRODUCT_DB_NAME);

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.PRODUCT_DB_HOST,
    port: Number(process.env.PRODUCT_DB_PORT),
    username: process.env.PRODUCT_DB_USER,
    password: process.env.PRODUCT_DB_PASSWORD,
    database: process.env.PRODUCT_DB_NAME,
    entities: ENTITIES,
    synchronize: true,
  });

  return dataSource.initialize();
}

export async function clearDatabase(dataSource: DataSource): Promise<void> {
  assertIsTestDatabase(dataSource.options.database as string | undefined);

  const tableNames = dataSource.entityMetadatas.map((entity) => `"${entity.tableName}"`);

  if (tableNames.length === 0) {
    return;
  }

  await dataSource.query(`TRUNCATE TABLE ${tableNames.join(', ')} RESTART IDENTITY CASCADE;`);
}
