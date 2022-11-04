import * as fsPromises from 'fs/promises';
import express = require('express');
import { Express, Request, Response } from 'express';
import path = require('path');
import { DataSource } from 'typeorm';
import Eta = require('eta');
import { helpers } from './helpers';
import { ImageGen } from './imageGen';

export class pageMapper {

    static pathDef = "page_definitions";
    static pages = new Map<string, any>();
    static pageJsonByPageName : Map<string, string>;
    static badPages = new Map<string, any>();
    static db : DataSource;

    static async mapPages(db: DataSource, app : express.Express) {
        this.db = db;
        
        const files = await fsPromises.readdir(pageMapper.pathDef, {withFileTypes: true});

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
                page.formatPrice = helpers.formatPrice;
                page.getItem = (productID) => { const item = helpers.getItem(db, productID); if(item == null) { throw new NotFoundError(); } return item; };
                page.getItems = (catAndSubcatStrings? : Array<string>, itemTypes? : Array<string>, itemTags? : Array<string>) => helpers.getItems(db, catAndSubcatStrings, itemTypes, itemTags);
                page.getPreview = (previewPage, howMany=3) => this.getPreviewData(previewPage, howMany);
                page.getAlsoLike = (dbProductNumber : number, catAndSubcatStrings? : Array<string>, itemTypes? : Array<string>, itemTags? : Array<string>, howMany=3) => helpers.getAlsoLike(db, howMany, dbProductNumber, catAndSubcatStrings, itemTypes, itemTags);
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

    static getPreviewData(previewPage : string, howMany : number) {
        const page = pageMapper.pages.get(previewPage);

        if(page == null) {
            return null;
        }

        const prodPage = page as productsPageData;
        const items = helpers.getAlsoLike(pageMapper.db, howMany, null, prodPage.categories, prodPage.itemTypes, prodPage.tags);
        page.items = items;

        return page;
    }


}

class requiredPageData {
    page: string;
    pageTheme: string;
    pageType: string;
    loadProducts: boolean;

    public constructor(init?:Partial<requiredPageData>) {
        Object.assign(this, init);
    }

    hasRequiredData() : boolean {
        return this.page != null && this.pageTheme != null && this.pageType != null && this.loadProducts != null;
    }
}

class productsPageData {
        gridItemClass: string;
        categories?: string[]
        itemTypes?: string[]
        tags?: string[]
}

class NotFoundError extends Error {

}