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
import Eta = require('eta');
import https = require('https');
import fs = require("fs");
import * as fsPromises from 'fs/promises';

import {authRouter} from "./auth";
import { items } from './admin/items';
import path = require('path');
import { pageMapper } from './pageMapper';
import { helpers } from './helpers';
import { ImageGen } from './imageGen';
import { item } from './entities/item';
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

Eta.configure({
  views: path.join(__dirname, "page_parts")
})

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
app.use(express.static('assets'));

passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());


// Handles whenever the root directory of the website is accessed.
app.get("/", async function(req: Request, res: Response) {

  const fileText = await (await fsPromises.readFile("preview_definitions.json")).toString();
  const previewPages = JSON.parse(fileText).homePreviews as Array<string>;

  const previewValues = await Promise.all(previewPages.map(async (p) => 
    {
      const data = await pageMapper.getPreviewData(myDataSource, p);
      return data;
    }))

  const previews = new Map(previewValues.map((v) => [v.page, v]));

  const template = "<%~ includeFile('./main.eta', it) %>"

  const it = { 
    pageTemplate: "home.eta",
    formatPrice: helpers.formatPrice,
    previews: previews };

  const rendered = Eta.render(template, it)
  res.send(rendered);
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

pageMapper.mapPages(myDataSource, app);

app.use("/admin", authRouter);

app.get("/admin/items", secured, async function(req: Request, res: Response) {
    //res.send(Eta.render('The answer to everything is <%= it.answer %>', { answer: 42 }));
    res.send(await items.renderGetItems(myDataSource));
});

app.get("/admin/edit", secured, async function(req: Request, res: Response) {
    //res.send(Eta.render('The answer to everything is <%= it.answer %>', { answer: 42 }));
    res.send(await items.renderEditItem(myDataSource, Number(req.query.id)));
});

app.get("/products/:pid", async function(req: Request, res: Response) {
  const template = "<%~ includeFile('./main.eta', it) %>"

  const item = (await getItems.getItem(myDataSource, req.params.pid));

  if(item == null) {
    res.sendStatus(404);
  }

  const suggest = await helpers.getSuggestions(myDataSource, `${item.itemCategoryID}-${item.itemSubcategoryID}`, 3, item.generatedID);

  const translatedItem = Array.from(translateObject.toWebsiteObject([item]).values())[0];
  const it = { 
    gridItemClass: "halloween",
    pageTemplate: "product.eta",
    theme: translatedItem.Cat,
    formatPrice: helpers.formatPrice,
    data: translatedItem,
    suggest: suggest};

  const rendered = Eta.render(template, it);

  res.send(rendered);
});

app.get("/productsTest", async function(req: Request, res: Response) {

  const template = "<%~ includeFile('./main.eta', it) %>"

  const items = (await getItems.getItems(myDataSource, ["06-08"]));
  const translatedItems = Array.from(translateObject.toWebsiteObject(items).values())[0];
  const it = { 
    banner: "title_graphic_halloween.png", 
    bannerAlt: "Halloween Title Graphic", 
    gridItemClass: "halloween",
    pageTemplate: "product.eta",
    theme: "halloween",
    formatPrice: helpers.formatPrice,
    data: translatedItems };

  const rendered = Eta.render(template, it);

  res.send(rendered);
  
})

app.get("/admin/import", secured, async function(req: Request, res: Response) {
    const options = {
        host: 'www.sweet-dreams-boutique.com',
        path: `/${req.query.json}`,
        
      };
      
     const callback = function(response) {
        var str = '';
      
        //another chunk of data has been received, so append it to `str`
        response.on('data', function (chunk) {
          str += chunk;
        });
      
        //the whole response has been received, so we just print it out here
        response.on('end', async function () {
          console.log(str);
          await jsonImport.parseJsonIntoDBFromText(myDataSource, str);
        });
      }
      
      https.request(options, callback).end();});

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

  app.get("/dynamicSample", async function(req: Request, res: Response) {

    const catString = req.query.cats as string;
    const cats = catString == null ? null as Array<string> : catString.split(',');
    const itemTypeString = req.query.itemTypes as string;
    const itemTypes = itemTypeString == null ? null as Array<string> : itemTypeString.split(',');
    const tagString = req.query.tags as string;
    const tags = tagString == null ? null as Array<string> : tagString.split(',');
    const bannerDataUri = req.query.bannerText ? await ImageGen.getBanner(req.query.bannerText as string) : null;

    const items = (await getItems.getItems(myDataSource, cats, itemTypes, tags));
    
    const webItemsMap = translateObject.toWebsiteObject(items);

    const template = "<%~ includeFile('./main.eta', it) %>"
                  
    const translatedItems = Array.from(translateObject.toWebsiteObject(items).values());
    const it = { 
      banner: bannerDataUri ? bannerDataUri : `/${req.query.banner}`, 
      bannerAlt: req.query.bannerAlt, 
      gridItemClass: req.query.gridItemClass,
      pageTemplate: `products.eta`,
      additionalClasses: [`${req.query.pageTheme}-grid-content`],
      theme: req.query.pageTheme,
      formatPrice: helpers.formatPrice,
      data: translatedItems };
  
    const rendered = Eta.render(template, it);
  
    res.send(rendered);
  });

  if(fs.existsSync("key.pem")) {
    https
    .createServer(
      // Provide the private and public key to the server by reading each
      // file's content with the readFileSync() method.
      {
        key: fs.readFileSync("key.pem"),
        cert: fs.readFileSync("cert.pem"),
      },
      app
    )
    .listen(3000, () => {
      console.log("serever is runing at port 3000");
    });
  }
  else {
    // Set app to listen on port 3000
    app.listen(3000, async function() {
        // const database = await db.openDb(sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

        // await database.initializeIfNeeded();

        // await database.parseJsonIntoDB("halloween_items.json");

        console.log("server is running on port 3000");
    });
  }
