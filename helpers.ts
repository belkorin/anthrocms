export class helpers {
    static formatPrice(price) {
        return price.toLocaleString(undefined, //use system culture to format the number
        {   //automatically add a $ and the appropriate number of decimal places
            style:"currency",
            currency:"USD",
            currencyDisplay:"narrowSymbol"
        });
    }
}