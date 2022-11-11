import { DataSource } from "typeorm";
import { getItems } from "../data/getItems";
import { translateObject } from "../data/translateToWebsiteObject";
import { item } from "../entities/item";
import wait = require('wait-for-stuff');
import { websiteItem } from "./models/websiteItem";
import { productListPage } from "./models/productListPage";
import { NotFoundError } from "./notFoundError";

export class items {

    /** @hidden */
    db : DataSource;
    getPage : Function;

    /** @hidden */
    constructor(db : DataSource, getPage : Function) {
        this.db = db;
        this.getPage = getPage;
    }

    /**
     * Retrieves a single item from the database
     * 
     * @param itemID the item's multi-part item id (`XX-YY[-zz]-AAA`)
     * @returns the requested item
     * @throws NotFoundError, which is caught by the page mapper and a 404 error will be sent to the browser
     */
    getItem(itemID : string) : websiteItem {
        const i = wait.for.promise(getItems.getItem(this.db, itemID));

        if(i == null || i.length == 0) {
            throw new NotFoundError();
        }

        const item = Array.from(translateObject.toWebsiteObject([i]).values())[0];

        return item;
    }

    /**
     * Gets all items matching the given filters from the database. 
     *  * All parameters are optional.
     *  * The filtering is OR within each parameter
     *  * The filtering is AND among each parameter
     * 
     * @example
     * ```ts
     * getItems(['06-08', '06-09'])
     * ```
     * will return all items that are in category 06-08 or 06-09
     * 
     * @example
     * ```ts
     * getItems(['06-08', '06-09'], ['earrings'])
     * ```
     * will return all items that are classified as earrings, and are also in category 06-08 or 06-09
     * 
     * @param catsWithSubcats an array of multi-part category-subcategory strings (`XX-YY` or `XX-YY-zz`)
     * @param types an array of item type names
     * @param tags an array of item tags
     * @returns All items matching the filters
     */
    getItems(catsWithSubcats: string[] = null, types: string[] = null, tags: string[] = null) : websiteItem[] {
        const items = wait.for.promise(getItems.getItems(this.db, catsWithSubcats, types, tags));
        const webItems = Array.from(translateObject.toWebsiteObject(items).values());
        
        return webItems;
    }

    /**
     * Gets a number of random items that match the given filters, optionally excluding a particular item (don't recommend the item you're already looking at)
     * Filtering behaves the same as {@link getItems}
     * 
     * @param howMany the number of matching items to return
     * @param itemToExclude the multi-part item id (`XX-YY[-zz]-AAA`) to be excluded from the results
     * @param catsWithSubcats an array of multi-part category-subcategory strings (`XX-YY` or `XX-YY-zz`)
     * @param types an array of item type names
     * @param tags an array of item tags
     * @returns the requested number of matching items, chosen randomly, suitable for a "you may also like" box. Use {@link getPreviewData} for page review boxes
     */
    getAlsoLike(howMany : number, itemToExclude : string = null, catsWithSubcats: string[] = null, types: string[] = null, tags: string[] = null) : websiteItem[] {
        const suggestionPageItems = wait.for.promise(getItems.getItems(this.db, catsWithSubcats, types, tags));
        const suggestedItems = new Array<item>();
        while(suggestedItems.length < howMany && suggestedItems.length < suggestionPageItems.length) {
            let index = Math.floor(Math.random() * suggestionPageItems.length);
            let itm = suggestionPageItems[index];
            if(!suggestedItems.includes(itm) && translateObject.getItemIDString(itm) != itemToExclude) { //no duplicates!
                suggestedItems.push(itm);
            }
        }
        
        const suggest = Array.from(translateObject.toWebsiteObject(suggestedItems, false).values());

        return suggest;
    }

    /**
     * Gets the product list page information for a given page, and a number of random items that will be displayed in that list. 
     * 
     * @param previewPage the name of the product list page to be previewed 
     * @param howMany the number of matching items to return
     * 
     * @returns the full product list page object, with `howMany` random items from that page in the `items` property
     */
    getPreviewData(previewPage : string, howMany : number = 3) {
        const page = this.getPage(previewPage);

        if(page == null) {
            return null;
        }

        const prodPage = page as productsPageData;
        const items = this.getAlsoLike(howMany, null, prodPage.categories, prodPage.itemTypes, prodPage.tags);
        page.previewItems = items;

        return new productListPage(page);
    }
}

/** @hidden */
class productsPageData {
    categories?: string[]
    itemTypes?: string[]
    tags?: string[]
}