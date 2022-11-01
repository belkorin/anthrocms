import * as express from 'express';
import { Express, Request, Response } from 'express';
import { getItems } from './data/getItems';
import { translateObject } from './data/translateToWebsiteObject';
import { myDataSource } from "./datasource";
import { jsonImport } from './jsonImport';
//import { db } from './db';

// establish database connection
myDataSource
    .initialize()
    .then(async () => {
        console.log("Data Source has been initialized!");

        // const items = await getItems.getItems(myDataSource, null, null, null, ["glow", "halloween"]);
        // console.log(items);
        //await jsonImport.parseJsonIntoDB(myDataSource, "halloween_items.json");//jsonImport.initializeCategories(myDataSource);
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    })

// Instantiating the Express object.
const app: Express = express();

// Handles whenever the root directory of the website is accessed.
app.get("/", function(req: Request, res: Response) {
  // Respond with Express
  res.send("Hello world! Stay a while and listen!");
});

app.get("/items", async function(req: Request, res: Response) {

    const catString = req.query.cats as string;
    const cats = catString == null ? null as Array<string> : catString.split(',');
    const itemTypeString = req.query.itemTypes as string;
    const itemTypes = itemTypeString == null ? null as Array<string> : itemTypeString.split(',');
    const tagString = req.query.tags as string;
    const tags = tagString == null ? null as Array<string> : tagString.split(',');

    const items = await getItems.getItems(myDataSource, cats, itemTypes, tags);
    
    const webItemsMap = translateObject.toWebsiteObject(items);

    // Respond with Express
    res.send(Object.fromEntries(webItemsMap));
  });

// Set app to listen on port 3000
app.listen(3000, async function() {
    // const database = await db.openDb(sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

    // await database.initializeIfNeeded();

    // await database.parseJsonIntoDB("halloween_items.json");

    console.log("server is running on port 3000");
});