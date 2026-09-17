import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialTicket1789600000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE ticket_status_enum AS ENUM ('CREATED', 'IN_PROGRESS', 'PENDING', 'DONE');
      EXCEPTION WHEN duplicate_object THEN NULL;
    END $$`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS ticket (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      title varchar NOT NULL, description text NOT NULL,
      "authorId" varchar NOT NULL, "authorEmail" varchar NOT NULL,
      status ticket_status_enum NOT NULL DEFAULT 'CREATED',
      "assignedTo" varchar, comment text,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      "updatedAt" timestamp NOT NULL DEFAULT now()
    )`);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE ticket');
    await queryRunner.query('DROP TYPE ticket_status_enum');
  }
}
