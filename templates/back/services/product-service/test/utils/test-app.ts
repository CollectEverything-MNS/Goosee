import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { StorageService } from '../../src/services/storage.service';
import { assertIsTestDatabase } from '../../src/test-utils/test-data-source';

export async function createTestApp(): Promise<INestApplication> {
  assertIsTestDatabase(process.env.PRODUCT_DB_NAME);

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider('LOG_CLIENT')
    .useValue({ emit: () => undefined, send: () => undefined })
    .overrideProvider(StorageService)
    .useValue({
      uploadFile: async () => ({ url: 'http://test/products/x.png', key: 'products/x.png' }),
      deleteFile: async () => undefined,
    })
    .compile();

  const app = moduleRef.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.init();

  return app;
}

export async function clearDatabase(app: INestApplication): Promise<void> {
  const dataSource = app.get<DataSource>(getDataSourceToken());
  assertIsTestDatabase(dataSource.options.database as string | undefined);

  const tableNames = dataSource.entityMetadatas.map((entity) => `"${entity.tableName}"`);

  if (tableNames.length === 0) {
    return;
  }

  await dataSource.query(`TRUNCATE TABLE ${tableNames.join(', ')} RESTART IDENTITY CASCADE;`);
}
