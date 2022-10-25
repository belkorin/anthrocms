import express from 'express';
import { Express, Request, Response } from 'express';
import { myDataSource } from "./datasource.js";
import { jsonImport } from './jsonImport.js';
//import { db } from './db';

// establish database connection
myDataSource
    .initialize()
    .then(async () => {
        console.log("Data Source has been initialized!");

        await jsonImport.initializeCategories(myDataSource);
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

// Set app to listen on port 3000
app.listen(3000, async function() {
    // const database = await db.openDb(sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

    // await database.initializeIfNeeded();

    // await database.parseJsonIntoDB("halloween_items.json");

    console.log("server is running on port 3000");
});