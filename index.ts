import express, { Express, Request, Response } from 'express';
import sqlite3 from 'sqlite3'
import { db } from './db';

// Instantiating the Express object.
const app: Express = express();

// Handles whenever the root directory of the website is accessed.
app.get("/", function(req: Request, res: Response) {
  // Respond with Express
  res.send("Hello world! Stay a while and listen!");
});

// Set app to listen on port 3000
app.listen(3000, async function() {
    console.log("starting db");

    const database = await db.openDb(sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

    await database.initializeIfNeeded();

    await database.parseJsonIntoDB("halloween_items.json");

    console.log("server is running on port 3000");
});