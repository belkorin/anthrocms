import { MigrationInterface, QueryRunner } from "typeorm";

export class dbinit1666667110692 implements MigrationInterface {
    name = 'dbinit1666667110692'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "item_sub_category" ("subCatID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "subCatName" varchar NOT NULL, "itemCategoryCatID" integer)`);
        await queryRunner.query(`CREATE TABLE "item_category" ("catID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "catName" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "item_tag" ("tagID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "tagName" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "item_type" ("typeID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "typeName" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "item" ("generatedID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "itemCategoryID" integer NOT NULL, "itemSubcategoryID" integer NOT NULL, "itemID" integer NOT NULL, "name" varchar NOT NULL, "shortDescription" varchar NOT NULL, "longDescription" varchar NOT NULL, "price" integer NOT NULL, "inStock" boolean NOT NULL, "itemTypeTypeID" integer, "itemCategoryCatID" integer, "itemSubCategorySubCatID" integer)`);
        await queryRunner.query(`CREATE TABLE "item_item_tags_item_tag" ("itemGeneratedID" integer NOT NULL, "itemTagTagID" integer NOT NULL, PRIMARY KEY ("itemGeneratedID", "itemTagTagID"))`);
        await queryRunner.query(`CREATE INDEX "IDX_673d5a9cfa3db48a64ba79a230" ON "item_item_tags_item_tag" ("itemGeneratedID") `);
        await queryRunner.query(`CREATE INDEX "IDX_2b913a17b158d8d73a6b94573e" ON "item_item_tags_item_tag" ("itemTagTagID") `);
        await queryRunner.query(`CREATE TABLE "temporary_item_sub_category" ("subCatID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "subCatName" varchar NOT NULL, "itemCategoryCatID" integer, CONSTRAINT "FK_bc3172ce660cf6058aa866626c5" FOREIGN KEY ("itemCategoryCatID") REFERENCES "item_category" ("catID") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_item_sub_category"("subCatID", "subCatName", "itemCategoryCatID") SELECT "subCatID", "subCatName", "itemCategoryCatID" FROM "item_sub_category"`);
        await queryRunner.query(`DROP TABLE "item_sub_category"`);
        await queryRunner.query(`ALTER TABLE "temporary_item_sub_category" RENAME TO "item_sub_category"`);
        await queryRunner.query(`CREATE TABLE "temporary_item" ("generatedID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "itemCategoryID" integer NOT NULL, "itemSubcategoryID" integer NOT NULL, "itemID" integer NOT NULL, "name" varchar NOT NULL, "shortDescription" varchar NOT NULL, "longDescription" varchar NOT NULL, "price" integer NOT NULL, "inStock" boolean NOT NULL, "itemTypeTypeID" integer, "itemCategoryCatID" integer, "itemSubCategorySubCatID" integer, CONSTRAINT "FK_4eae565e0e6ff2ea65ae3aa7ef4" FOREIGN KEY ("itemTypeTypeID") REFERENCES "item_type" ("typeID") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_b352f619a37b102f8fb8a58fcf7" FOREIGN KEY ("itemCategoryCatID") REFERENCES "item_category" ("catID") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_0400fef2a2f4557489b13940fdc" FOREIGN KEY ("itemSubCategorySubCatID") REFERENCES "item_sub_category" ("subCatID") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_item"("generatedID", "itemCategoryID", "itemSubcategoryID", "itemID", "name", "shortDescription", "longDescription", "price", "inStock", "itemTypeTypeID", "itemCategoryCatID", "itemSubCategorySubCatID") SELECT "generatedID", "itemCategoryID", "itemSubcategoryID", "itemID", "name", "shortDescription", "longDescription", "price", "inStock", "itemTypeTypeID", "itemCategoryCatID", "itemSubCategorySubCatID" FROM "item"`);
        await queryRunner.query(`DROP TABLE "item"`);
        await queryRunner.query(`ALTER TABLE "temporary_item" RENAME TO "item"`);
        await queryRunner.query(`DROP INDEX "IDX_673d5a9cfa3db48a64ba79a230"`);
        await queryRunner.query(`DROP INDEX "IDX_2b913a17b158d8d73a6b94573e"`);
        await queryRunner.query(`CREATE TABLE "temporary_item_item_tags_item_tag" ("itemGeneratedID" integer NOT NULL, "itemTagTagID" integer NOT NULL, CONSTRAINT "FK_673d5a9cfa3db48a64ba79a230d" FOREIGN KEY ("itemGeneratedID") REFERENCES "item" ("generatedID") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_2b913a17b158d8d73a6b94573e5" FOREIGN KEY ("itemTagTagID") REFERENCES "item_tag" ("tagID") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("itemGeneratedID", "itemTagTagID"))`);
        await queryRunner.query(`INSERT INTO "temporary_item_item_tags_item_tag"("itemGeneratedID", "itemTagTagID") SELECT "itemGeneratedID", "itemTagTagID" FROM "item_item_tags_item_tag"`);
        await queryRunner.query(`DROP TABLE "item_item_tags_item_tag"`);
        await queryRunner.query(`ALTER TABLE "temporary_item_item_tags_item_tag" RENAME TO "item_item_tags_item_tag"`);
        await queryRunner.query(`CREATE INDEX "IDX_673d5a9cfa3db48a64ba79a230" ON "item_item_tags_item_tag" ("itemGeneratedID") `);
        await queryRunner.query(`CREATE INDEX "IDX_2b913a17b158d8d73a6b94573e" ON "item_item_tags_item_tag" ("itemTagTagID") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_2b913a17b158d8d73a6b94573e"`);
        await queryRunner.query(`DROP INDEX "IDX_673d5a9cfa3db48a64ba79a230"`);
        await queryRunner.query(`ALTER TABLE "item_item_tags_item_tag" RENAME TO "temporary_item_item_tags_item_tag"`);
        await queryRunner.query(`CREATE TABLE "item_item_tags_item_tag" ("itemGeneratedID" integer NOT NULL, "itemTagTagID" integer NOT NULL, PRIMARY KEY ("itemGeneratedID", "itemTagTagID"))`);
        await queryRunner.query(`INSERT INTO "item_item_tags_item_tag"("itemGeneratedID", "itemTagTagID") SELECT "itemGeneratedID", "itemTagTagID" FROM "temporary_item_item_tags_item_tag"`);
        await queryRunner.query(`DROP TABLE "temporary_item_item_tags_item_tag"`);
        await queryRunner.query(`CREATE INDEX "IDX_2b913a17b158d8d73a6b94573e" ON "item_item_tags_item_tag" ("itemTagTagID") `);
        await queryRunner.query(`CREATE INDEX "IDX_673d5a9cfa3db48a64ba79a230" ON "item_item_tags_item_tag" ("itemGeneratedID") `);
        await queryRunner.query(`ALTER TABLE "item" RENAME TO "temporary_item"`);
        await queryRunner.query(`CREATE TABLE "item" ("generatedID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "itemCategoryID" integer NOT NULL, "itemSubcategoryID" integer NOT NULL, "itemID" integer NOT NULL, "name" varchar NOT NULL, "shortDescription" varchar NOT NULL, "longDescription" varchar NOT NULL, "price" integer NOT NULL, "inStock" boolean NOT NULL, "itemTypeTypeID" integer, "itemCategoryCatID" integer, "itemSubCategorySubCatID" integer)`);
        await queryRunner.query(`INSERT INTO "item"("generatedID", "itemCategoryID", "itemSubcategoryID", "itemID", "name", "shortDescription", "longDescription", "price", "inStock", "itemTypeTypeID", "itemCategoryCatID", "itemSubCategorySubCatID") SELECT "generatedID", "itemCategoryID", "itemSubcategoryID", "itemID", "name", "shortDescription", "longDescription", "price", "inStock", "itemTypeTypeID", "itemCategoryCatID", "itemSubCategorySubCatID" FROM "temporary_item"`);
        await queryRunner.query(`DROP TABLE "temporary_item"`);
        await queryRunner.query(`ALTER TABLE "item_sub_category" RENAME TO "temporary_item_sub_category"`);
        await queryRunner.query(`CREATE TABLE "item_sub_category" ("subCatID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "subCatName" varchar NOT NULL, "itemCategoryCatID" integer)`);
        await queryRunner.query(`INSERT INTO "item_sub_category"("subCatID", "subCatName", "itemCategoryCatID") SELECT "subCatID", "subCatName", "itemCategoryCatID" FROM "temporary_item_sub_category"`);
        await queryRunner.query(`DROP TABLE "temporary_item_sub_category"`);
        await queryRunner.query(`DROP INDEX "IDX_2b913a17b158d8d73a6b94573e"`);
        await queryRunner.query(`DROP INDEX "IDX_673d5a9cfa3db48a64ba79a230"`);
        await queryRunner.query(`DROP TABLE "item_item_tags_item_tag"`);
        await queryRunner.query(`DROP TABLE "item"`);
        await queryRunner.query(`DROP TABLE "item_type"`);
        await queryRunner.query(`DROP TABLE "item_tag"`);
        await queryRunner.query(`DROP TABLE "item_category"`);
        await queryRunner.query(`DROP TABLE "item_sub_category"`);
    }

}
