/**
 * A representation of the item information loosely matching the old json format
 */
export interface websiteItem {
    /**
     * The multi-part item ID (`XX-YY[-zz]-AAA)
     */
    id : string;
    /**
     * The item's name
     */
    Name: string;
    /**
     * A short description of the item, suitable for use in product lists
     */
    Description: string;
    /**
     * A long description of the item, suitable for use on product pages
     */
    LongDescription: string;
    /**
     * The raw item price
     */
    price: number;
    /**
     * The item's type
     */
    Type: string;
    /**
     * The name of the item's subcategory
     */
    Cat: string;
    /**
     * The multi-part category-subcategory number (`XX-YY` or `XX-YY-zz`)
     */
    CatNumber: string;
    /**
     * An array of tags for the item
     */
    tags: string[];
    /**
     * The URL path for the thumbnail image
     */
    Image: string;
    /**
     * The URL path for the full image
     */
    ImageFull: string;
    /**
     * An array of additional image URL paths for the lightbox gallery
     */
    GalleryImages: string[];
    /**
     * The URL path for the product page
     */
    Link: string;
    /**
     * The generated ID number for this item in the database
     */
    dbProductNumber: number;
}