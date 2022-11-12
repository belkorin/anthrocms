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
import http = require('http');
import fs = require("fs");

import {authRouter} from "./auth";
import { items } from './admin/items';
import path = require('path');
import { pageMapper } from './pageMapper';
import { ImageGen } from './imageGen';
declare module 'express-session' {
  interface SessionData {
    returnTo: string;
  }
}

function controller(req: express.Request, res: express.Response) {
  req.session.returnTo;
}

//import { db } from './db';

// Instantiating the Express object.
const app: Express = express();

Eta.configure({
  views: path.join(__dirname, "page_parts")
})

const scriptSources = ["'self'", "'unsafe-inline'"];
const styleSources = ["'self'", "'unsafe-inline'"];
const connectSources = ["'self'"];

app.use(helmet({contentSecurityPolicy: {directives: {
  defaultSrc: ["'self'"],
  scriptSrc: scriptSources,
  scriptSrcElem: scriptSources,
  scriptSrcAttr: scriptSources,
  styleSrc: styleSources,
  connectSrc: connectSources} } }));

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
app.use('/docs', express.static('docs'));

passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

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

//TODO: PUT AUTHENTICATION BACK

app.get("/admin/items", async function(req: Request, res: Response) {
    //res.send(Eta.render('The answer to everything is <%= it.answer %>', { answer: 42 }));
    res.send(await items.renderGetItems(myDataSource));
});

app.get("/admin/edit", async function(req: Request, res: Response) {
    //res.send(Eta.render('The answer to everything is <%= it.answer %>', { answer: 42 }));
    res.send(await items.renderEditItem(myDataSource, Number(req.query.id)));
});

app.get("/admin/import", async function(req: Request, res: Response) {
    const options = {
        host: 'localhost',
        path: `/${req.query.json}`,
        port: 3000
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
      
      http.request(options, callback).end();});

// establish database connection
myDataSource
    .initialize()
    .then(async () => {
        console.log("Data Source has been initialized!");
        startServer();
        // const items = await getItems.getItems(myDataSource, null, null, null, ["glow", "halloween"]);
        // console.log(items);
        //await jsonImport.parseJsonIntoDB(myDataSource, "halloween_items.json");//jsonImport.initializeCategories(myDataSource);
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    })

function startServer() {
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
}
