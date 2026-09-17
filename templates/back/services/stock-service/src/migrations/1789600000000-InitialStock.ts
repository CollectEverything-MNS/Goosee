import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialStock1789600000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS stock (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      "productId" uuid NOT NULL UNIQUE,
      quantity integer NOT NULL DEFAULT 0,
      "updatedAt" timestamp NOT NULL DEFAULT now()
    )`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS stock_reservation (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      "productId" uuid NOT NULL, "orderId" uuid NOT NULL,
      quantity integer NOT NULL, status varchar NOT NULL DEFAULT 'held',
      "expiresAt" timestamptz NOT NULL, "createdAt" timestamp NOT NULL DEFAULT now()
    )`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS stock_movement (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      "productId" uuid NOT NULL, delta integer NOT NULL, "orderId" uuid,
      "createdAt" timestamp NOT NULL DEFAULT now()
    )`);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE stock_movement, stock_reservation, stock');
  }
}
