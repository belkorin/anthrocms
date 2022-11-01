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
    price: number;
    Type: string;
    Cat: string;
    tags: string[];
    Image: string;
    Link: string;

    constructor(item: item) {
        const paddedCat = item.itemCategoryID.toString().padStart(2, "0");
        const paddedSubcat = item.itemSubcategoryID.toString().padStart(2, "0");
        const paddedItem = item.itemID.toString().padStart(3, "0");

        this.id = `${paddedCat}-${paddedSubcat}-${paddedItem}`;
        this.Name = item.name;
        this.Description = item.shortDescription;
        this.price = item.price;
        this.Type = item.itemType.typeName;
        this.Cat = item.itemSubCategory.subCatName;
        this.tags = item.itemTags == null ? null : item.itemTags.map((x) => x.tagName);
        this.Image = `https://www.sweet-dreams-boutique.com/photos/cat_${paddedCat}-${paddedSubcat}/${this.id}-thumb.png`;
        this.Link = `/products/${this.id}`;
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