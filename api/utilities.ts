/**
 * Provides general utilities for rendering the page
 */
export class utilities {

    /** @hidden */
    constructor() {}

    /**
     * Formats an item price as a proper two decimal USD price string
     * 
     * @param price the price
     * @returns a string formatted as a two decimal USD price
     */
    formatPrice(price : number) {
        return price.toLocaleString("en-us",
        {   //automatically add a $ and the appropriate number of decimal places
            style:"currency",
            currency:"USD",
            currencyDisplay:"narrowSymbol"
        });
    }
}
