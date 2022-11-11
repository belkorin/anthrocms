import * as fsPromises from 'fs/promises';
import express = require('express');
import { Express, Request, Response } from 'express';
import path = require('path');
import { DataSource } from 'typeorm';
import Eta = require('eta');
import { ImageGen } from './imageGen';
import { utilities } from './api/utilities';
import { items } from './api/items';
import { NotFoundError } from './api/notFoundError';

export class pageMapper {

    static pathDef = "page_definitions";
    static pages = new Map<string, any>();
    static pageJsonByPageName : Map<string, string>;
    static badPages = new Map<string, any>();
    static db : DataSource;

    static async mapPages(db: DataSource, app : express.Express) {
        this.db = db;
        
        const files = await fsPromises.readdir(pageMapper.pathDef, {withFileTypes: true});

        const util = new utilities();
        const itemHelper = new items(this.db, (page) => this.pages.get(page));

        for (const file of files) {
            if(file.isFile() && file.name.endsWith(".json")) {
                const fileText = await (await fsPromises.readFile(path.join(pageMapper.pathDef, file.name))).toString();
                const page = JSON.parse(fileText);

                const reqPageData = new requiredPageData(page);
                if(!reqPageData.hasRequiredData()) {
                    this.badPages.set(file.name, page);
                    continue;
                }
                
                const bannerDataUri = page.bannerText ? await ImageGen.getBanner(page.bannerText) : null;
                page.banner = bannerDataUri ?? page.banner;
                page.utilities = util;
                page.itemsApi = itemHelper;
                page.pageTemplate = `${reqPageData.pageType}.eta`;

                this.pages.set(reqPageData.page, page);

                const parametersArray = new Array<string>();
                if(page.parameters) {
                    for (const p of page.parameters) {
                        parametersArray.push(`:${p}`);
                    }
                }

                const parameters = parametersArray.length > 0 ? `/${parametersArray.join('/')}` : "";

                app.get(`/${page.page}${parameters}`, async function(req: Request, res: Response) {

                    try {
                        const template = "<%~ includeFile('./main.eta', it) %>"

                        const pageName = (req.route.path.substring(1) as string).replace(parameters, "");
                        let thePage = pageMapper.pages.get(pageName);

                        if(thePage == null) {
                            res.sendStatus(500);
                            return;
                        }

                        thePage.parameters = req.params;

                        const rendered = Eta.render(template, thePage);
                    
                        res.send(rendered);
                    }
                    catch(e) {
                        if(e instanceof NotFoundError) {
                            res.sendStatus(404);
                        }
                        else {
                            const err = e as Error;
                            res.status(500).send(err.message+"<br><br>"+err.stack);
                        }
                    }
                  })
            }
        }
    }
}

class requiredPageData {
    page: string;
    pageTheme: string;
    pageType: string;

    public constructor(init?:Partial<requiredPageData>) {
        Object.assign(this, init);
    }

    hasRequiredData() : boolean {
        return this.page != null && this.pageTheme != null && this.pageType != null;
    }
}
