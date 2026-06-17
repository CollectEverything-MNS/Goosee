import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class Init1718553800000 implements MigrationInterface {
  name = 'Init1718553800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'orderId', type: 'uuid', isNullable: false },
          { name: 'amountCents', type: 'int', isNullable: false },
          { name: 'currency', type: 'varchar', default: "'eur'" },
          { name: 'status', type: 'varchar', default: "'pending'" },
          { name: 'provider', type: 'varchar', default: "'stripe'" },
          { name: 'providerRef', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_payments_providerRef',
        columnNames: ['providerRef'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payments');
  }
}
