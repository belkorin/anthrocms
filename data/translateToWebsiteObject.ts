import { imperfectItem } from "../entities/imperfectItem";
import { item } from "../entities/item";

export class translateObject {
    static toWebsiteObject(items : item[]) {
        const webItems = items.flatMap((i) => new Array(new websiteItem(i), ...i.imperfectItems.map((x) => websiteItem.fromDefect(i, x))));

        const webItemsMap = new Map(webItems.map((i) => [`Item ${i.id}`, i]));
        
        return webItemsMap;
    }

    static toItemIDString(cat : number, subCat : number, subCatB : number, itemID : number, defect: boolean) {
        const paddedCat = cat.toString().padStart(2, "0");
        const paddedSubcat = subCat.toString().padStart(2, "0");
        const paddedItem = itemID.toString().padStart(3, "0");

        const strBuild = new Array(paddedCat, paddedSubcat);
        if(subCatB != 0) {
            const paddedSubcatB = subCatB.toString().padStart(2, "0");
            strBuild.push(paddedSubcatB)
        }

        strBuild.push(paddedItem);

        const str = strBuild.join('-');

        return `${str}${defect ? 'D' : ''}`;
    }
}

class websiteItem {
    id : string;
    Name: string;
    Description: string;
    LongDescription: string;
    price: number;
    Type: string;
    Cat: string;
    CatNumber: string;
    tags: string[];
    Image: string;
    ImageFull: string;
    Link: string;
    dbProductNumber: number;

    constructor(item: item) {

        this.id = translateObject.toItemIDString(item.itemCategoryID, item.itemSubcategoryID, item.itemSecondarySubCategoryID ?? 0, item.itemID, false);
        const catStr = this.id.substring(0, item.itemSecondarySubCategoryID == null ? 5 : 8);
        this.Name = item.name;
        this.Description = item.shortDescription;
        this.LongDescription = item.longDescription;
        this.price = item.price;
        this.Type = item.itemType.typeName;
        this.Cat = item.itemSubCategory.subCatName;
        this.CatNumber = catStr;
        this.tags = item.itemTags == null ? null : item.itemTags.map((x) => x.tagName);
        this.Image = `/photos/cat_${catStr}/${this.id}-thumb.png`;
        this.ImageFull = `/photos/cat_${catStr}/${this.id}-full.png`;
        this.Link = `/products/${this.id}`;
        this.dbProductNumber = item.generatedID;
    }

    static fromDefect(item: item, defect : imperfectItem) {
        const webItem = new websiteItem(item);
        webItem.id = translateObject.toItemIDString(item.itemCategoryID, item.itemSubcategoryID, item.itemSecondarySubCategoryID ?? 0, item.itemID, true);
        webItem.Description = defect.defectDescription;
        webItem.tags.push("imperfect");
        return webItem;
    }
}
/*
						"Image": "https://www.sweet-dreams-boutique.com/photos/cat_06-08/06-08-005-thumb.png",
						"Name": "Witchy Owl earrings",
						"Description": "A pair of witchy owl earrings.",
						"price": 5.00,
						"Link": "https://www.sweet-dreams-boutique.com/products/06-08-005",
						"Type": "earrings",
						"Cat": "halloween"
*/