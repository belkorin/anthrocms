import { MigrationInterface, QueryRunner } from "typeorm";

export class dbinit1667934134199 implements MigrationInterface {
    name = 'dbinit1667934134199'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "imperfect_item" ("generatedID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "defectDescription" varchar NOT NULL, "inStock" boolean NOT NULL, "parentItemGeneratedID" integer)`);
        await queryRunner.query(`CREATE TABLE "item_sub_category" ("subCatID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "subCatName" varchar NOT NULL, "itemCategoryCatID" integer)`);
        await queryRunner.query(`CREATE TABLE "item_category" ("catID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "catName" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "item_tag" ("tagID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "tagName" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "item_type" ("typeID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "typeName" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "item" ("generatedID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "itemCategoryID" integer NOT NULL, "itemSubcategoryID" integer NOT NULL, "itemSecondarySubCategoryID" integer NOT NULL, "itemID" integer NOT NULL, "name" varchar NOT NULL, "shortDescription" varchar NOT NULL, "longDescription" varchar NOT NULL, "price" integer NOT NULL, "inStock" boolean NOT NULL, "itemTypeTypeID" integer, "itemCategoryCatID" integer, "itemSubCategorySubCatID" integer, "itemSecondarySubCategorySubCatID" integer)`);
        await queryRunner.query(`CREATE TABLE "item_tag_items_item" ("itemTagTagID" integer NOT NULL, "itemGeneratedID" integer NOT NULL, PRIMARY KEY ("itemTagTagID", "itemGeneratedID"))`);
        await queryRunner.query(`CREATE INDEX "IDX_10e10719856fa4b8f4187ccc94" ON "item_tag_items_item" ("itemTagTagID") `);
        await queryRunner.query(`CREATE INDEX "IDX_29d3c410d653a34afdf972a747" ON "item_tag_items_item" ("itemGeneratedID") `);
        await queryRunner.query(`CREATE TABLE "temporary_imperfect_item" ("generatedID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "defectDescription" varchar NOT NULL, "inStock" boolean NOT NULL, "parentItemGeneratedID" integer, CONSTRAINT "FK_25535c87e81ab04a5365caadb4f" FOREIGN KEY ("parentItemGeneratedID") REFERENCES "item" ("generatedID") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_imperfect_item"("generatedID", "defectDescription", "inStock", "parentItemGeneratedID") SELECT "generatedID", "defectDescription", "inStock", "parentItemGeneratedID" FROM "imperfect_item"`);
        await queryRunner.query(`DROP TABLE "imperfect_item"`);
        await queryRunner.query(`ALTER TABLE "temporary_imperfect_item" RENAME TO "imperfect_item"`);
        await queryRunner.query(`CREATE TABLE "temporary_item_sub_category" ("subCatID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "subCatName" varchar NOT NULL, "itemCategoryCatID" integer, CONSTRAINT "FK_bc3172ce660cf6058aa866626c5" FOREIGN KEY ("itemCategoryCatID") REFERENCES "item_category" ("catID") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_item_sub_category"("subCatID", "subCatName", "itemCategoryCatID") SELECT "subCatID", "subCatName", "itemCategoryCatID" FROM "item_sub_category"`);
        await queryRunner.query(`DROP TABLE "item_sub_category"`);
        await queryRunner.query(`ALTER TABLE "temporary_item_sub_category" RENAME TO "item_sub_category"`);
        await queryRunner.query(`CREATE TABLE "temporary_item" ("generatedID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "itemCategoryID" integer NOT NULL, "itemSubcategoryID" integer NOT NULL, "itemSecondarySubCategoryID" integer NOT NULL, "itemID" integer NOT NULL, "name" varchar NOT NULL, "shortDescription" varchar NOT NULL, "longDescription" varchar NOT NULL, "price" integer NOT NULL, "inStock" boolean NOT NULL, "itemTypeTypeID" integer, "itemCategoryCatID" integer, "itemSubCategorySubCatID" integer, "itemSecondarySubCategorySubCatID" integer, CONSTRAINT "FK_4eae565e0e6ff2ea65ae3aa7ef4" FOREIGN KEY ("itemTypeTypeID") REFERENCES "item_type" ("typeID") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_b352f619a37b102f8fb8a58fcf7" FOREIGN KEY ("itemCategoryCatID") REFERENCES "item_category" ("catID") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_0400fef2a2f4557489b13940fdc" FOREIGN KEY ("itemSubCategorySubCatID") REFERENCES "item_sub_category" ("subCatID") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_afffb0a7530540913cc8651f81f" FOREIGN KEY ("itemSecondarySubCategorySubCatID") REFERENCES "item_sub_category" ("subCatID") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_item"("generatedID", "itemCategoryID", "itemSubcategoryID", "itemSecondarySubCategoryID", "itemID", "name", "shortDescription", "longDescription", "price", "inStock", "itemTypeTypeID", "itemCategoryCatID", "itemSubCategorySubCatID", "itemSecondarySubCategorySubCatID") SELECT "generatedID", "itemCategoryID", "itemSubcategoryID", "itemSecondarySubCategoryID", "itemID", "name", "shortDescription", "longDescription", "price", "inStock", "itemTypeTypeID", "itemCategoryCatID", "itemSubCategorySubCatID", "itemSecondarySubCategorySubCatID" FROM "item"`);
        await queryRunner.query(`DROP TABLE "item"`);
        await queryRunner.query(`ALTER TABLE "temporary_item" RENAME TO "item"`);
        await queryRunner.query(`DROP INDEX "IDX_10e10719856fa4b8f4187ccc94"`);
        await queryRunner.query(`DROP INDEX "IDX_29d3c410d653a34afdf972a747"`);
        await queryRunner.query(`CREATE TABLE "temporary_item_tag_items_item" ("itemTagTagID" integer NOT NULL, "itemGeneratedID" integer NOT NULL, CONSTRAINT "FK_10e10719856fa4b8f4187ccc943" FOREIGN KEY ("itemTagTagID") REFERENCES "item_tag" ("tagID") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_29d3c410d653a34afdf972a7474" FOREIGN KEY ("itemGeneratedID") REFERENCES "item" ("generatedID") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("itemTagTagID", "itemGeneratedID"))`);
        await queryRunner.query(`INSERT INTO "temporary_item_tag_items_item"("itemTagTagID", "itemGeneratedID") SELECT "itemTagTagID", "itemGeneratedID" FROM "item_tag_items_item"`);
        await queryRunner.query(`DROP TABLE "item_tag_items_item"`);
        await queryRunner.query(`ALTER TABLE "temporary_item_tag_items_item" RENAME TO "item_tag_items_item"`);
        await queryRunner.query(`CREATE INDEX "IDX_10e10719856fa4b8f4187ccc94" ON "item_tag_items_item" ("itemTagTagID") `);
        await queryRunner.query(`CREATE INDEX "IDX_29d3c410d653a34afdf972a747" ON "item_tag_items_item" ("itemGeneratedID") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_29d3c410d653a34afdf972a747"`);
        await queryRunner.query(`DROP INDEX "IDX_10e10719856fa4b8f4187ccc94"`);
        await queryRunner.query(`ALTER TABLE "item_tag_items_item" RENAME TO "temporary_item_tag_items_item"`);
        await queryRunner.query(`CREATE TABLE "item_tag_items_item" ("itemTagTagID" integer NOT NULL, "itemGeneratedID" integer NOT NULL, PRIMARY KEY ("itemTagTagID", "itemGeneratedID"))`);
        await queryRunner.query(`INSERT INTO "item_tag_items_item"("itemTagTagID", "itemGeneratedID") SELECT "itemTagTagID", "itemGeneratedID" FROM "temporary_item_tag_items_item"`);
        await queryRunner.query(`DROP TABLE "temporary_item_tag_items_item"`);
        await queryRunner.query(`CREATE INDEX "IDX_29d3c410d653a34afdf972a747" ON "item_tag_items_item" ("itemGeneratedID") `);
        await queryRunner.query(`CREATE INDEX "IDX_10e10719856fa4b8f4187ccc94" ON "item_tag_items_item" ("itemTagTagID") `);
        await queryRunner.query(`ALTER TABLE "item" RENAME TO "temporary_item"`);
        await queryRunner.query(`CREATE TABLE "item" ("generatedID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "itemCategoryID" integer NOT NULL, "itemSubcategoryID" integer NOT NULL, "itemSecondarySubCategoryID" integer NOT NULL, "itemID" integer NOT NULL, "name" varchar NOT NULL, "shortDescription" varchar NOT NULL, "longDescription" varchar NOT NULL, "price" integer NOT NULL, "inStock" boolean NOT NULL, "itemTypeTypeID" integer, "itemCategoryCatID" integer, "itemSubCategorySubCatID" integer, "itemSecondarySubCategorySubCatID" integer)`);
        await queryRunner.query(`INSERT INTO "item"("generatedID", "itemCategoryID", "itemSubcategoryID", "itemSecondarySubCategoryID", "itemID", "name", "shortDescription", "longDescription", "price", "inStock", "itemTypeTypeID", "itemCategoryCatID", "itemSubCategorySubCatID", "itemSecondarySubCategorySubCatID") SELECT "generatedID", "itemCategoryID", "itemSubcategoryID", "itemSecondarySubCategoryID", "itemID", "name", "shortDescription", "longDescription", "price", "inStock", "itemTypeTypeID", "itemCategoryCatID", "itemSubCategorySubCatID", "itemSecondarySubCategorySubCatID" FROM "temporary_item"`);
        await queryRunner.query(`DROP TABLE "temporary_item"`);
        await queryRunner.query(`ALTER TABLE "item_sub_category" RENAME TO "temporary_item_sub_category"`);
        await queryRunner.query(`CREATE TABLE "item_sub_category" ("subCatID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "subCatName" varchar NOT NULL, "itemCategoryCatID" integer)`);
        await queryRunner.query(`INSERT INTO "item_sub_category"("subCatID", "subCatName", "itemCategoryCatID") SELECT "subCatID", "subCatName", "itemCategoryCatID" FROM "temporary_item_sub_category"`);
        await queryRunner.query(`DROP TABLE "temporary_item_sub_category"`);
        await queryRunner.query(`ALTER TABLE "imperfect_item" RENAME TO "temporary_imperfect_item"`);
        await queryRunner.query(`CREATE TABLE "imperfect_item" ("generatedID" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "defectDescription" varchar NOT NULL, "inStock" boolean NOT NULL, "parentItemGeneratedID" integer)`);
        await queryRunner.query(`INSERT INTO "imperfect_item"("generatedID", "defectDescription", "inStock", "parentItemGeneratedID") SELECT "generatedID", "defectDescription", "inStock", "parentItemGeneratedID" FROM "temporary_imperfect_item"`);
        await queryRunner.query(`DROP TABLE "temporary_imperfect_item"`);
        await queryRunner.query(`DROP INDEX "IDX_29d3c410d653a34afdf972a747"`);
        await queryRunner.query(`DROP INDEX "IDX_10e10719856fa4b8f4187ccc94"`);
        await queryRunner.query(`DROP TABLE "item_tag_items_item"`);
        await queryRunner.query(`DROP TABLE "item"`);
        await queryRunner.query(`DROP TABLE "item_type"`);
        await queryRunner.query(`DROP TABLE "item_tag"`);
        await queryRunner.query(`DROP TABLE "item_category"`);
        await queryRunner.query(`DROP TABLE "item_sub_category"`);
        await queryRunner.query(`DROP TABLE "imperfect_item"`);
    }

}
