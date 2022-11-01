// import * as fsPromises from 'fs/promises'
// import { DataSource } from 'typeorm';
// import { itemCategory } from './entities/itemCategory';

// export class jsonToDB {

//     async parseJsonIntoDB(db : DataSource, jsonFile : string) {
//         const json = (await fsPromises.readFile(jsonFile)).toString();

//         const obj = JSON.parse(json);

//         const items = Object.keys(obj).map((k) => new itemModel(k, obj[k]));

//         const typesMap = await this.getTypesMap(items);
//         const catsMap = await this.getCategoriesMap(items);

//         const dbItems = items.map((i) => {
//             let cats = [ new itemCategory { catName = catsMap.get(i.cat)!, id = i.cat)];

//             if(i.cat2) {
//                 cats.push(new catDBModel(catsMap.get(i.cat2)!, i.cat2));
//             }

//             return new itemDBModel(i, new typeDBModel(typesMap.get(i.type)!, i.type), cats);
//         });
//     }

    
    
//     async getCategoriesMap(items:itemModel[]) {
        
//         const cats = items.map((i) => i.cat);

//         let localCatMaps = new Map<string, number>();
//         for (const item of items) {
//             if(!localCatMaps.has(item.cat)) {
//                 localCatMaps.set(item.cat, item.catB);
//             }
//         }

//         let catsMap = await this.getDbPairs("ItemCategories", "catID", cats);

//         const catsToAdd = Array.from(localCatMaps.entries()).filter((t) => !catsMap.has(t[0])).map((t) => new catDBModel(t[1], t[0]));

//         let sql = `
//         insert or replace into ItemCategories (name, catID) values
//         ${catsToAdd.map((t) => `('${t.name}', ${t.catID})`).join('\r\n,')}
//         `
//         await this._database?.run(sql);

//         const secondaryCatsToAdd = Array.from(new Set(items.map((i) => i.cat2).filter((c) => !catsMap.has(c))).entries());

//         sql = `
//         insert or replace into ItemCategories (name) values
//         ${secondaryCatsToAdd.map((t) => `('${t}')`).join('\r\n,')}
//         `;

//         await this._database?.run(sql);

//         catsMap = await this.getDbPairs("ItemCategories", "catID", cats);

//         return catsMap;
//     }
// }

// class itemModel {
//     id : string;
//     catA : number;
//     catB : number;
//     itemId : number;
//     name: string;
//     description: string;
//     price: number;
//     type: string;
//     cat: string;
//     cat2: string;

//     constructor(id: string, item : any) {
//         this.id = id;
//         this.name = item.Name;
//         this.description = item.Description;
//         this.price = item.price;
//         this.type = item.Type;
//         this.cat = item.Cat;
//         this.cat2 = item.Cat2;

//         let idParts = id.split(' ')[1].split('-');
//         this.catA = Number.parseInt(idParts[0]);
//         this.catB = Number.parseInt(idParts[1]);
//         this.itemId = Number.parseInt(idParts[2]);
//     }
// }

// // class itemDBModel {
// //     catA: number;
// //     catB: number;
// //     itemID: number;
// //     name: string;
// //     shortDescription: string;
// //     longDescription?: string;
// //     price: number;
// //     typeID: number;
// //     inStock: boolean;
// //     itemType: typeDBModel;
// //     itemCategories: catDBModel[];

// //     constructor(item:itemModel, itemType: typeDBModel, itemCategories: catDBModel[]) {
// //         this.catA = item.catA;
// //         this.catB = item.catB;
// //         this.itemID = item.itemId;
// //         this.name = item.name;
// //         this.shortDescription = item.description;
// //         this.price = item.price * 100;
// //         this.itemType = itemType;
// //         this.itemCategories = itemCategories;
// //         this.typeID = itemType.typeID;
// //         this.inStock = true;
// //     }
// // }

// // class typeDBModel { 
// //     typeID : number
// //     name: string

// //     constructor(typeID:number, name:string) {
// //         this.typeID = typeID;
// //         this.name = name;
// //     }
// // }
// // class catDBModel {
// //     catID : number
// //     name: string

// //     constructor(catID:number, name:string) {
// //         this.catID = catID;
// //         this.name = name;
// //     }
// // }