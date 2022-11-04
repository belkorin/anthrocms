import { DataSource } from "typeorm";
import { getItems } from "./data/getItems";
import { translateObject } from "./data/translateToWebsiteObject";
import { item } from "./entities/item";
import wait = require('wait-for-stuff');

export class helpers {
    static formatPrice(price : number) {
        return price.toLocaleString(undefined, //use system culture to format the number
        {   //automatically add a $ and the appropriate number of decimal places
            style:"currency",
            currency:"USD",
            currencyDisplay:"narrowSymbol"
        });
    }

    static getItem(db : DataSource, pid : string) {
        const i = wait.for.promise(getItems.getItem(db, pid));

        const item = Array.from(translateObject.toWebsiteObject([i]).values())[0];

        return item;
    }

    static getItems(db : DataSource, catsWithSubcats?: string[], types: string[] = null, tags: string[] = null) {
        const items = wait.for.promise(getItems.getItems(db, catsWithSubcats, types, tags));
        const webItems = Array.from(translateObject.toWebsiteObject(items).values());
        
        return webItems;
    }

    static getAlsoLike(db : DataSource, howMany : number, itemToExclude? : number, catsWithSubcats?: string[], types: string[] = null, tags: string[] = null) {
        const suggestionPageItems = wait.for.promise(getItems.getItems(db, catsWithSubcats, types, tags));
        const suggestedItems = new Array<item>();
        while(suggestedItems.length < howMany && suggestedItems.length < suggestionPageItems.length) {
            let index = Math.floor(Math.random() * suggestionPageItems.length);
            let itm = suggestionPageItems[index];
            if(!suggestedItems.includes(itm) && itm.generatedID != itemToExclude) { //no duplicates!
                suggestedItems.push(itm);
            }
        }
        
        const suggest = Array.from(translateObject.toWebsiteObject(suggestedItems).values());

        return suggest;
    }
}