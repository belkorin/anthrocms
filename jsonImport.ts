import * as fsPromises from 'fs/promises'
import { DataSource } from 'typeorm';
import { item } from './entities/item.js';
import { itemCategory } from './entities/itemCategory.js';
import { itemSubCategory } from './entities/itemSubCategory.js';
import { itemTag } from './entities/itemTag.js';
import { itemType } from './entities/itemType.js';

export class jsonImport {

    static async initializeCategories(db : DataSource) {
        const json = (await fsPromises.readFile("categories.json")).toString(); 
        const obj = JSON.parse(json);
        const categories = Object.keys(obj).map((k) => new itemCategory({
            catID: obj[k].catID,
            catName: obj[k].catName,
            subCategories: obj[k].subcats.map((s) => new itemSubCategory({subCatID: s.subCatID, subCatName: s.subCatName}))
        }));

        const categoriesTable = db.getRepository(itemCategory);
        await categoriesTable.save(categories);
    }

    static async parseJsonIntoDB(db : DataSource, jsonFile : string) {
        const json = (await fsPromises.readFile(jsonFile)).toString(); 
        const obj = JSON.parse(json);
        const items = Object.keys(obj).map((k) => new itemModel(k, obj[k]));

        const itemTypes = Array.from(new Set(items.map((i) => i.type)));
        const itemTags = Array.from(new Set(items.flatMap((i) => i.cats)));

        const itemTypesTable = db.getRepository(itemType);
        var knownItemTypes = await itemTypesTable.find();

        const toBeInsertedTypes = itemTypes
                                    .filter((t) => knownItemTypes.findIndex((dbType) => dbType.typeName.toUpperCase() == t) == -1)
                                    .map((t) => new itemType({typeName: t}));
        if(toBeInsertedTypes.length > 0) {
            const result = await itemTypesTable.insert(toBeInsertedTypes);
            knownItemTypes = await itemTypesTable.find();
        }

        const itemTagsTable = db.getRepository(itemTag);
        var knownItemTags = await itemTagsTable.find();

        const toBeInsertedTags = itemTags
                                    .filter((t) => knownItemTags.findIndex((dbType) => dbType.tagName.toUpperCase() == t) == -1)
                                    .map((t) => new itemTag({tagName: t}));
        if(toBeInsertedTags.length > 0) {
            const result = await itemTagsTable.insert(toBeInsertedTags);
            knownItemTags = await itemTagsTable.find();
        }

        var typeNameToTypeMap = new Map<string, itemType>(knownItemTypes.map((t) => [t.typeName, t]));
        var tagNameToTagMap = new Map<string, itemTag>(knownItemTags.map((t) => [t.tagName, t]));

        const newItems = items.map((i) => new item({
            itemCategoryID : i.catA,
            itemSubcategoryID : i.catB,
            inStock : true,
            itemID : i.itemId,
            name : i.name,
            shortDescription : i.description,
            price : i.price,
            itemType : typeNameToTypeMap[i.type],
            itemTags : i.cats.map((c) => tagNameToTagMap[c])
        }));

        const itemsTable = db.getRepository(item);
        await itemsTable.save(newItems);

        const sample = await itemsTable.find({take: 10});
        console.log(sample);
    }

}

class itemModel {
    id : string;
    catA : number;
    catB : number;
    itemId : number;
    name: string;
    description: string;
    price: number;
    type: string;
    cat: string;
    cats: string[];

    constructor(id: string, item : any) {
        this.id = id;
        this.name = item.Name;
        this.description = item.Description;
        this.price = item.price;
        this.type = item.Type;
        this.cat = item.Cat;
        this.cats = (item.Cats ?? new Array<string>()).push(item.Cat);

        let idParts = id.split(' ')[1].split('-');
        this.catA = Number.parseInt(idParts[0]);
        this.catB = Number.parseInt(idParts[1]);
        this.itemId = Number.parseInt(idParts[2]);
    }
}