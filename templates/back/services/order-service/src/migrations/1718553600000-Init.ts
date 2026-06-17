import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Init1718553600000 implements MigrationInterface {
  name = 'Init1718553600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'customerId', type: 'uuid', isNullable: true },
          { name: 'customerEmail', type: 'varchar', isNullable: false },
          { name: 'items', type: 'jsonb', isNullable: false },
          { name: 'totalCents', type: 'int', isNullable: false },
          { name: 'status', type: 'varchar', default: "'pending'" },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('orders');
  }
}
