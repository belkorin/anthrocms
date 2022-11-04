# anthrocms
functions provided to the template engine:

it.getItem(productID : string)  
&nbsp;&nbsp;&nbsp;&nbsp;Gets the product by it's multi-part item ID

it.getItems(catAndSubcatStrings? : Array<string>, itemTypes? : Array<string>, itemTags? : Array<string>)  
&nbsp;&nbsp;&nbsp;&nbsp;get items filtered by arrays of category-subcategory, item types, and item tags. Pass null for any type of filter you don't want to use.
  
it.getPreview(previewPage : string, howMany=3 : number)  
&nbsp;&nbsp;&nbsp;&nbsp;gathers the necessary data to fill in the preview page component, where previewPage is the name of the product list page to preview
  
it.getAlsoLike(dbProductNumber : number, catAndSubcatStrings? : Array<string>, itemTypes? : Array<string>, itemTags? : Array<string>, howMany=3 : number)  
&nbsp;&nbsp;&nbsp;&nbsp;gathers a number of random related items based on the provided filters, that work the same as the regular getItems function. dbProductNumber is the numeric generated id used in the database, and is found in item.dbProductNumber
