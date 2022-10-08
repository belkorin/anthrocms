import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'
import fsPromises from 'fs/promises'

export class db {

    _database? : Database<sqlite3.Database, sqlite3.Statement>;

    static async openDb(mode? : number) {

        const databaseCore = await open({
            filename: 'db.sqlite',
            mode: mode ?? sqlite3.OPEN_READONLY,
            driver: sqlite3.cached.Database
        });

        const database = new db();
        database._database = databaseCore;
        return database;
    }

    async initializeIfNeeded() {
        const sql = `
      CREATE TABLE IF NOT EXISTS ItemTypes (
        typeID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ItemCategories (
        catID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS ItemTypeGroups (
        typeGroupID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS Items (
        catA INTEGER NOT NULL,
        catB INTEGER NOT NULL,
        itemID INTEGER NOT NULL,
        name TEXT NOT NULL,
        shortDescription TEXT NOT NULL,
        longDescription TEXT,
        price INTEGER NOT NULL,
        typeID INTEGER NOT NULL,
        inStock BOOLEAN NOT NULL,
        PRIMARY KEY(catA, catB, itemID),
        FOREIGN KEY(typeID) references ItemTypes(typeID)
       );
       
       CREATE TABLE IF NOT EXISTS CategoryItemPairs (
        catID INTEGER NOT NULL,
        itemID INTEGER NOT NULL,
        PRIMARY KEY(catID, itemID),
        FOREIGN KEY(catID) references ItemCategories(catID),
        FOREIGN KEY(itemID) references Items(itemID)
       );
       
      CREATE TABLE IF NOT EXISTS ItemTypeGroupTypes (
        typeID INTEGER NOT NULL,
        typeGroupID INTEGER NOT NULL,
        PRIMARY KEY(typeID, typeGroupID),
        FOREIGN KEY(typeID) references ItemTypes(typeID),
        FOREIGN KEY(typeGroupID) references ItemTypeGroups(itemID)
      );
       `

       await this._database?.exec(sql);
    }

    async parseJsonIntoDB(jsonFile : string) {
        const json = (await fsPromises.readFile(jsonFile)).toString();

        const obj = JSON.parse(json);

        const items = Object.keys(obj).map((k) => new itemModel(k, obj[k]));

        const typesMap = await this.getTypesMap(items);
        const catsMap = await this.getCategoriesMap(items);

        const dbItems = items.map((i) => {
            let cats = [ new catDBModel(catsMap.get(i.cat)!, i.cat)];

            if(i.cat2) {
                cats.push(new catDBModel(catsMap.get(i.cat2)!, i.cat2));
            }

            return new itemDBModel(i, new typeDBModel(typesMap.get(i.type)!, i.type), cats);
        });

        
    }

    async getTypesMap(items:itemModel[]) {
        
        const types = items.map((i) => i.type);

        let localTypesMap = new Map<string, number>();
        for (const item of items) {
            if(!localTypesMap.has(item.type)) {
                localTypesMap.set(item.type, item.catA);
            }
        }

        let typesMap = await this.getDbPairs("ItemTypes", "typeID", types);

        const typesToAdd = types.filter((t) => !typesMap.has(t)).map((t) => new typeDBModel(localTypesMap.get(t)!, t));

        let sql = `
        insert into ItemTypes (name, typeID) values
        ${typesToAdd.map((t) => `('${t.name}', ${t.typeID})`).join('\r\n,')}
        `
        await this._database?.run(sql);

        typesMap = await this.getDbPairs("ItemTypes", "typeID", types);

        return typesMap;
    }

    
    async getCategoriesMap(items:itemModel[]) {
        
        const cats = items.map((i) => i.cat);

        let localCatMaps = new Map<string, number>();
        for (const item of items) {
            if(!localCatMaps.has(item.cat)) {
                localCatMaps.set(item.cat, item.catB);
            }
        }

        let catsMap = await this.getDbPairs("ItemCategories", "catID", cats);

        const catsToAdd = Array.from(localCatMaps.entries()).filter((t) => !catsMap.has(t[0])).map((t) => new catDBModel(t[1], t[0]));

        let sql = `
        insert into ItemCategories (name, catID) values
        ${catsToAdd.map((t) => `('${t.name}', ${t.catID})`).join('\r\n,')}
        `
        await this._database?.run(sql);

        const secondaryCatsToAdd = Array.from(new Set(items.map((i) => i.cat2).filter((c) => !catsMap.has(c))).entries());

        sql = `
        insert into ItemCategories (name) values
        ${secondaryCatsToAdd.map((t) => `('${t}')`).join('\r\n,')}
        `;

        await this._database?.run(sql);

        catsMap = await this.getDbPairs("ItemCategories", "catID", cats);

        return catsMap;
    }

    async getDbPairs(table: string, keyCol: string, names : string[])
    {
        const wrappedNames = names.map((t) => `'${t}'`);

        let sql = `
        select name, ${keyCol} from ${table}
        where name in (${wrappedNames.join(',')})
        `;

        const knownTypes = await this._database!.all(sql);
        const typesMap = new Map<string, number>();
        for (const knownType of knownTypes) {
            typesMap.set(knownType.name, knownType.typeID);
        }

        return typesMap;
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
    cat2: string;

    constructor(id: string, item : any) {
        this.id = id;
        this.name = item.Name;
        this.description = item.Description;
        this.price = item.price;
        this.type = item.Type;
        this.cat = item.Cat;
        this.cat2 = item.Cat2;

        let idParts = id.split(' ')[1].split('-');
        this.catA = Number.parseInt(idParts[0]);
        this.catB = Number.parseInt(idParts[1]);
        this.itemId = Number.parseInt(idParts[2]);
    }
}

class itemDBModel {
    catA: number;
    catB: number;
    itemID: number;
    name: string;
    shortDescription: string;
    longDescription?: string;
    price: number;
    typeID: number;
    inStock: boolean;
    itemType: typeDBModel;
    itemCategories: catDBModel[];

    constructor(item:itemModel, itemType: typeDBModel, itemCategories: catDBModel[]) {
        this.catA = item.catA;
        this.catB = item.catB;
        this.itemID = item.itemId;
        this.name = item.name;
        this.shortDescription = item.description;
        this.price = item.price * 100;
        this.itemType = itemType;
        this.itemCategories = itemCategories;
        this.typeID = itemType.typeID;
        this.inStock = true;
    }
}

class typeDBModel { 
    typeID : number
    name: string

    constructor(typeID:number, name:string) {
        this.typeID = typeID;
        this.name = name;
    }
}
class catDBModel {
    catID : number
    name: string

    constructor(catID:number, name:string) {
        this.catID = catID;
        this.name = name;
    }
}