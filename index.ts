import express = require('express');
import { Express, Request, Response } from 'express';
import { getItems } from './data/getItems';
import { translateObject } from './data/translateToWebsiteObject';
import { myDataSource } from "./datasource";
import { jsonImport } from './jsonImport';
import cors = require("cors");
import helmet from "helmet";
import dotenv  = require( "dotenv");
import expressSession  = require( 'express-session');
import Auth0Strategy  = require( 'passport-auth0');
import passport  = require( 'passport');

import {authRouter} from "./auth";

declare module 'express-session' {
  interface SessionData {
    returnTo: string;
  }
}

function controller(req: express.Request, res: express.Response) {
  req.session.returnTo;
}

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

app.use(helmet());
app.use(cors());

const session = {
    secret: process.env.SESSION_SECRET,
    cookie: {},
    resave: false,
    saveUninitialized: false
};

const strategy = new Auth0Strategy(
    {
        domain: process.env.AUTH0_DOMAIN,
        clientID: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
        callbackURL: process.env.AUTH0_CALLBACK_URL
    },
    function(accessToken, refreshToken, extraParams, profile, done) {
        /**
         * Access tokens are used to authorize users to an API
         * (resource server)
         * accessToken is the token to call the Auth0 API
         * or a secured third-party API
         * extraParams.id_token has the JSON Web Token
         * profile has all the information from the user
         */
        return done(null, profile);
    }
);

passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((user, done) => {
    done(null, user);
  });

app.use(expressSession(session));

passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());


// Handles whenever the root directory of the website is accessed.
app.get("/", function(req: Request, res: Response) {
  // Respond with Express
  res.send("Hello world! Stay a while and listen!");
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
  });

const secured = (req, res, next) => {
    if (req.user) {
        return next();
    }
    req.session.returnTo = req.originalUrl;
    res.redirect("/admin/login");
};

app.use("/admin", authRouter);

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

app.get("/admin/items", secured, function(req: Request, res: Response) {
    res.send("hello from admin items");
    
})

// Set app to listen on port 3000
app.listen(3000, async function() {
    // const database = await db.openDb(sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

    // await database.initializeIfNeeded();

    // await database.parseJsonIntoDB("halloween_items.json");

    console.log("server is running on port 3000");
});
