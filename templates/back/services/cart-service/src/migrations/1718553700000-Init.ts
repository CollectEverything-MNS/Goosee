import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class Init1718553700000 implements MigrationInterface {
  name = 'Init1718553700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.createTable(
      new Table({
        name: 'carts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'sessionKey', type: 'varchar', isNullable: false },
          { name: 'customerId', type: 'uuid', isNullable: true },
          { name: 'items', type: 'jsonb', default: "'[]'" },
          { name: 'totalCents', type: 'int', default: 0 },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      'carts',
      new TableIndex({
        name: 'IDX_carts_sessionKey',
        columnNames: ['sessionKey'],
        isUnique: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('carts');
  }
}
