import { DataSource } from "typeorm";
import { getItems } from "./data/getItems";
import { translateObject } from "./data/translateToWebsiteObject";
import { item } from "./entities/item";

export class helpers {
    static formatPrice(price : number) {
        return price.toLocaleString(undefined, //use system culture to format the number
        {   //automatically add a $ and the appropriate number of decimal places
            style:"currency",
            currency:"USD",
            currencyDisplay:"narrowSymbol"
        });
    }
    static async getSuggestions(db : DataSource, cat : string, howMany : number, itemToExclude? : number) {
        const sameCatItems = await getItems.getItems(db, [cat]);
        const suggestedItems = new Array<item>();
        while(suggestedItems.length < 3 && suggestedItems.length < sameCatItems.length) {
            let index = Math.floor(Math.random() * sameCatItems.length);
            let itm = sameCatItems[index];
            if(!suggestedItems.includes(itm) && itm.generatedID != itemToExclude) { //no duplicates!
                suggestedItems.push(itm);
            }
        }
        
        const suggest = Array.from(translateObject.toWebsiteObject(suggestedItems).values());

        return suggest;
    }
}