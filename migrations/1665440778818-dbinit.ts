import { MigrationInterface, QueryRunner } from "typeorm";

export class dbinit1665440778818 implements MigrationInterface {
    name = 'dbinit1665440778818'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "item_category" ("catID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "catName" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "item_type" ("typeID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "typeName" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "item" ("generatedID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "catA" integer NOT NULL, "catB" integer NOT NULL, "itemID" integer NOT NULL, "name" varchar NOT NULL, "shortDescription" varchar NOT NULL, "longDescription" varchar NOT NULL, "price" integer NOT NULL, "inStock" boolean NOT NULL, "itemTypeTypeID" integer)`);
        await queryRunner.query(`CREATE TABLE "item_item_categories_item_category" ("itemGeneratedID" integer NOT NULL, "itemCategoryCatID" integer NOT NULL, PRIMARY KEY ("itemGeneratedID", "itemCategoryCatID"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e8ffc3878724f58865e23a8ee5" ON "item_item_categories_item_category" ("itemGeneratedID") `);
        await queryRunner.query(`CREATE INDEX "IDX_dc33e0b88ab23348563a0a13c1" ON "item_item_categories_item_category" ("itemCategoryCatID") `);
        await queryRunner.query(`CREATE TABLE "temporary_item" ("generatedID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "catA" integer NOT NULL, "catB" integer NOT NULL, "itemID" integer NOT NULL, "name" varchar NOT NULL, "shortDescription" varchar NOT NULL, "longDescription" varchar NOT NULL, "price" integer NOT NULL, "inStock" boolean NOT NULL, "itemTypeTypeID" integer, CONSTRAINT "FK_4eae565e0e6ff2ea65ae3aa7ef4" FOREIGN KEY ("itemTypeTypeID") REFERENCES "item_type" ("typeID") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_item"("generatedID", "catA", "catB", "itemID", "name", "shortDescription", "longDescription", "price", "inStock", "itemTypeTypeID") SELECT "generatedID", "catA", "catB", "itemID", "name", "shortDescription", "longDescription", "price", "inStock", "itemTypeTypeID" FROM "item"`);
        await queryRunner.query(`DROP TABLE "item"`);
        await queryRunner.query(`ALTER TABLE "temporary_item" RENAME TO "item"`);
        await queryRunner.query(`DROP INDEX "IDX_e8ffc3878724f58865e23a8ee5"`);
        await queryRunner.query(`DROP INDEX "IDX_dc33e0b88ab23348563a0a13c1"`);
        await queryRunner.query(`CREATE TABLE "temporary_item_item_categories_item_category" ("itemGeneratedID" integer NOT NULL, "itemCategoryCatID" integer NOT NULL, CONSTRAINT "FK_e8ffc3878724f58865e23a8ee5f" FOREIGN KEY ("itemGeneratedID") REFERENCES "item" ("generatedID") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_dc33e0b88ab23348563a0a13c19" FOREIGN KEY ("itemCategoryCatID") REFERENCES "item_category" ("catID") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("itemGeneratedID", "itemCategoryCatID"))`);
        await queryRunner.query(`INSERT INTO "temporary_item_item_categories_item_category"("itemGeneratedID", "itemCategoryCatID") SELECT "itemGeneratedID", "itemCategoryCatID" FROM "item_item_categories_item_category"`);
        await queryRunner.query(`DROP TABLE "item_item_categories_item_category"`);
        await queryRunner.query(`ALTER TABLE "temporary_item_item_categories_item_category" RENAME TO "item_item_categories_item_category"`);
        await queryRunner.query(`CREATE INDEX "IDX_e8ffc3878724f58865e23a8ee5" ON "item_item_categories_item_category" ("itemGeneratedID") `);
        await queryRunner.query(`CREATE INDEX "IDX_dc33e0b88ab23348563a0a13c1" ON "item_item_categories_item_category" ("itemCategoryCatID") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_dc33e0b88ab23348563a0a13c1"`);
        await queryRunner.query(`DROP INDEX "IDX_e8ffc3878724f58865e23a8ee5"`);
        await queryRunner.query(`ALTER TABLE "item_item_categories_item_category" RENAME TO "temporary_item_item_categories_item_category"`);
        await queryRunner.query(`CREATE TABLE "item_item_categories_item_category" ("itemGeneratedID" integer NOT NULL, "itemCategoryCatID" integer NOT NULL, PRIMARY KEY ("itemGeneratedID", "itemCategoryCatID"))`);
        await queryRunner.query(`INSERT INTO "item_item_categories_item_category"("itemGeneratedID", "itemCategoryCatID") SELECT "itemGeneratedID", "itemCategoryCatID" FROM "temporary_item_item_categories_item_category"`);
        await queryRunner.query(`DROP TABLE "temporary_item_item_categories_item_category"`);
        await queryRunner.query(`CREATE INDEX "IDX_dc33e0b88ab23348563a0a13c1" ON "item_item_categories_item_category" ("itemCategoryCatID") `);
        await queryRunner.query(`CREATE INDEX "IDX_e8ffc3878724f58865e23a8ee5" ON "item_item_categories_item_category" ("itemGeneratedID") `);
        await queryRunner.query(`ALTER TABLE "item" RENAME TO "temporary_item"`);
        await queryRunner.query(`CREATE TABLE "item" ("generatedID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "catA" integer NOT NULL, "catB" integer NOT NULL, "itemID" integer NOT NULL, "name" varchar NOT NULL, "shortDescription" varchar NOT NULL, "longDescription" varchar NOT NULL, "price" integer NOT NULL, "inStock" boolean NOT NULL, "itemTypeTypeID" integer)`);
        await queryRunner.query(`INSERT INTO "item"("generatedID", "catA", "catB", "itemID", "name", "shortDescription", "longDescription", "price", "inStock", "itemTypeTypeID") SELECT "generatedID", "catA", "catB", "itemID", "name", "shortDescription", "longDescription", "price", "inStock", "itemTypeTypeID" FROM "temporary_item"`);
        await queryRunner.query(`DROP TABLE "temporary_item"`);
        await queryRunner.query(`DROP INDEX "IDX_dc33e0b88ab23348563a0a13c1"`);
        await queryRunner.query(`DROP INDEX "IDX_e8ffc3878724f58865e23a8ee5"`);
        await queryRunner.query(`DROP TABLE "item_item_categories_item_category"`);
        await queryRunner.query(`DROP TABLE "item"`);
        await queryRunner.query(`DROP TABLE "item_type"`);
        await queryRunner.query(`DROP TABLE "item_category"`);
    }

}
