import { websiteItem } from "./websiteItem";
import { items } from "../items";
import { utilities } from "../utilities";

/**
 * The basic information used to fill in the template for a product list page.
 * Any extra values added to the json definition will be appended to this class and made available to the template
 */
export class productListPage {
    /**
     * The URL path for the banner image.
     * 
     * If left null in the json definition, and {@link bannerText} is populated, a banner image will be generated from that text and filled in this field as a data url
     */
    bannerURL: string;
    /**
     * The text to be rendered on a banner image if no banner image is specified in the json definition
     */
    bannerText: string;
    /**
     * alt text for the banner image
     */
    bannerAlt: string;
    /** 
     * the page name, used for the url path
     */
    page: string;
    /**
     * the template file that the page will use
     */
    pageType: string;
    /**
     * the text to be displayed at the top of the page below the banner
     */
    themeDesc: string;
    /**
     * the text to be displayed in the preview description
     */
    shortDesc: string;
    /**
     * an array of category-subcategory strings to filter the products to (`XX-YY` or `XX-YY-zz`)
     */
    categories: string[];
    /**
     * an array of item type strings to filter the products to
     */
    itemTypes: string[];
    /**
     * an array of item tag strings to filter the products to
     */
    tags: string[];
    /**
     * string to be used to append to css class assignements (like `grid-content` becomes `halloween-grid-content`)
     */
    pageTheme: string;
    /**
     * items to be shown in a preview block.  
     * **Only populated when this was retrieved by {@link items.items.getPreviewData}**
     * 
     */
    previewItems: websiteItem[];

    /**
     * the items API object for getting item info
     */
    itemsApi : items;
    /**
     * the utility api
     */
    utilities : utilities;

    /** @hidden */
    public constructor(init?:Partial<productListPage>) {
        Object.assign(this, init);
    }
}