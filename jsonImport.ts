import * as fsPromises from 'fs/promises'
import { DataSource } from 'typeorm';
import { translateObject } from './data/translateToWebsiteObject';
import { imperfectItem } from './entities/imperfectItem';
import { item } from './entities/item';
import { itemCategory } from './entities/itemCategory';
import { itemSubCategory } from './entities/itemSubCategory';
import { itemTag } from './entities/itemTag';
import { itemType } from './entities/itemType';

export class jsonImport {

    static async initializeCategories(db : DataSource) {
        const json = (await fsPromises.readFile("categories.json")).toString(); 
        const obj = JSON.parse(json);
        const categories = obj.categories.map((k) => new itemCategory({
            catID: k.catID,
            catName: k.catName,
            subCategories: k.subcats.map((s) => new itemSubCategory({subCatID: s.subCatID, subCatName: s.subcatName}))
        }));

        const categoriesTable = db.getRepository(itemCategory);
        await categoriesTable.save(categories);
    }

    static async parseJsonIntoDB(db : DataSource, jsonFile : string) {

        const json = (await fsPromises.readFile(jsonFile)).toString();
        await this.parseJsonIntoDBFromText(db, json);
    }

    static async parseJsonIntoDBFromText(db : DataSource, json : string) {
        //jsonImport.initializeCategories(db);

        const obj = JSON.parse(json);
        const items = Object.keys(obj).map((k) => new itemModel(k, obj[k]));

        const itemTypes = Array.from(new Set(items.map((i) => Array.isArray(i.type) ? i.type[0] : i.type)));
        const itemTags = Array.from(new Set(items.flatMap((i) => i.cats)));

        const itemTypesTable = db.getRepository(itemType);
        var knownItemTypes = await itemTypesTable.find();

        const toBeInsertedTypes = itemTypes
                                    .filter((t) => knownItemTypes.findIndex(
                                        (dbType) => dbType.typeName.toUpperCase() == t.toUpperCase()) == -1)
                                    .map((t) => new itemType({typeName: t}));
        if(toBeInsertedTypes.length > 0) {
            const result = await itemTypesTable.insert(toBeInsertedTypes);
            knownItemTypes = await itemTypesTable.find();
        }

        const itemTagsTable = db.getRepository(itemTag);
        var knownItemTags = await itemTagsTable.find();

        const toBeInsertedTags = itemTags
                                    .filter((t) => t != undefined && knownItemTags.findIndex(
                                        (dbType) => dbType.tagName.toUpperCase() == t.toUpperCase()) == -1)
                                    .map((t) => new itemTag({tagName: t}));
        if(toBeInsertedTags.length > 0) {
            const result = await itemTagsTable.insert(toBeInsertedTags);
            knownItemTags = await itemTagsTable.find();
        }

        const typeNameToTypeMap = new Map<string, itemType>(knownItemTypes.map((t) => [t.typeName, t]));
        const tagNameToTagMap = new Map<string, itemTag>(knownItemTags.map((t) => [t.tagName, t]));

        const categories = await db.getRepository(itemCategory).find();
        const subcategories = await db.getRepository(itemSubCategory).find();

        const catMap = new Map(categories.map((c) => [c.catID, c]));
        const subMap = new Map(subcategories.map((s) => [s.subCatID, s]));

        const itemsTable = db.getRepository(item);

        const rollupItems = new Map<string, Array<itemModel>>();

        items.forEach((i) => {
            const idString = translateObject.toItemIDString(i.catID, i.subCatA, i.subCatB ?? 0, i.itemId, false);
            if(!rollupItems.has(idString)) {
                rollupItems.set(idString, new Array<itemModel>());
            }

            rollupItems.get(idString).push(i);
         });

        const newItems = Array.from(rollupItems).map((g) => { 
            const i = g[1][0];
            
            const defects = g[1].filter((d) => d.imperfect).map((d) => new imperfectItem({
                defectDescription: d.description,
                inStock: true
            }));

            return new item({
                itemCategoryID : i.catID,
                itemSubcategoryID : i.subCatA,
                itemSecondarySubCategoryID : i.subCatB,
                inStock : true,
                itemID : i.itemId,
                name : i.name,
                shortDescription : i.description,
                longDescription : "",
                price : i.price,
                itemType : typeNameToTypeMap.get(i.type),
                itemTags : i.cats.length > 0 ? i.cats.map((c) => tagNameToTagMap.get(c)) : null,
                itemCategory : catMap.get(i.catID),
                itemSubCategory : subMap.get(i.subCatA),
                itemSecondarySubCategory: i.subCatB == null ? null : subMap.get(i.subCatB),
                imperfectItems : defects.length > 0 ? defects : null
            })
        });

        await itemsTable.save(newItems);

        const queryBuilder = itemsTable.createQueryBuilder("item").where('1 = 1')
        .leftJoinAndSelect("item.itemType", "itemType")
        .leftJoinAndSelect("item.itemCategory", "itemCategory")
        .leftJoinAndSelect("item.itemSubCategory", "itemSubCategory")
        .leftJoinAndSelect("item.imperfectItems", "imperfectItems")
        .leftJoinAndSelect("item.itemTags", "tags")
        .take(10);

        const sample = await queryBuilder.getMany();
        console.log(translateObject.toWebsiteObject(sample));
    }

}

class itemModel {
    id : string;
    catID : number;
    subCatA : number;
    subCatB? : number;
    itemId : number;
    name: string;
    description: string;
    price: number;
    type: string;
    cat: string;
    cats: string[];
    imperfect: boolean;

    constructor(id: string, item : any) {
        this.id = id;
        this.name = item.Name;
        this.description = item.Description;
        this.price = item.price;
        this.type = item.Type;
        this.catID = item.Cat;
        this.cats = (item.Cats ?? new Array<string>());
        if(item.Cat != undefined)
            this.cats.push(item.Cat);

        let idParts = id.split(' ')[1].split('-');
        this.catID = Number.parseInt(idParts[0]);
        this.subCatA = Number.parseInt(idParts[1]);
        let itemIdString = "";
        
        if(idParts.length > 3) {
            this.subCatB = Number.parseInt(idParts[2]);
            itemIdString = idParts[3];
        }
        else {
            itemIdString = idParts[2];
        }

        this.imperfect = itemIdString.endsWith("D");

        if(this.imperfect) {
            itemIdString = itemIdString.replace("D", "");
        }

        this.itemId = Number.parseInt(itemIdString);
    }
}