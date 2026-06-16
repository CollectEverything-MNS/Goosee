import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1781634805730 implements MigrationInterface {
    name = 'Init1781634805730'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."pages_status_enum" AS ENUM('draft', 'published')`);
        await queryRunner.query(`CREATE TYPE "public"."pages_type_enum" AS ENUM('home', 'catalog', 'contact', 'custom')`);
        await queryRunner.query(`CREATE TABLE "pages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "slug" character varying NOT NULL, "status" "public"."pages_status_enum" NOT NULL DEFAULT 'draft', "type" "public"."pages_type_enum" NOT NULL DEFAULT 'custom', "components" jsonb NOT NULL DEFAULT '[]', "metaTitle" character varying, "metaDescription" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_fe66ca6a86dc94233e5d7789535" UNIQUE ("slug"), CONSTRAINT "PK_8f21ed625aa34c8391d636b7d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "menus" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "label" character varying NOT NULL, "pageId" character varying, "externalUrl" character varying, "parentId" character varying, "order" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "openInNewTab" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_3fec3d93327f4538e0cbd4349c4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "site_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "logoUrl" character varying, "faviconUrl" character varying, "primaryColor" character varying, "metadata" jsonb NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e4290e8371a166d7e066d131f6e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "site_settings"`);
        await queryRunner.query(`DROP TABLE "menus"`);
        await queryRunner.query(`DROP TABLE "pages"`);
        await queryRunner.query(`DROP TYPE "public"."pages_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."pages_status_enum"`);
    }

}
