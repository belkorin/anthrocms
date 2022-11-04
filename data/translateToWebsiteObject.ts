import { item } from "../entities/item";

export class translateObject {
    static toWebsiteObject(items : item[]) {
        const webItems = items.map((i) => new websiteItem(i));

        const webItemsMap = new Map(webItems.map((i) => [`Item ${i.id}`, i]));
        
        return webItemsMap;
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
        const paddedCat = item.itemCategoryID.toString().padStart(2, "0");
        const paddedSubcat = item.itemSubcategoryID.toString().padStart(2, "0");
        const paddedItem = item.itemID.toString().padStart(3, "0");

        this.id = `${paddedCat}-${paddedSubcat}-${paddedItem}`;
        this.Name = item.name;
        this.Description = item.shortDescription;
        this.LongDescription = item.longDescription;
        this.price = item.price;
        this.Type = item.itemType.typeName;
        this.Cat = item.itemSubCategory.subCatName;
        this.CatNumber = `${paddedCat}-${paddedSubcat}`;
        this.tags = item.itemTags == null ? null : item.itemTags.map((x) => x.tagName);
        this.Image = `/photos/cat_${paddedCat}-${paddedSubcat}/${this.id}-thumb.png`;
        this.ImageFull = `/photos/cat_${paddedCat}-${paddedSubcat}/${this.id}-full.png`;
        this.Link = `/products/${this.id}`;
        this.dbProductNumber = item.generatedID;
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