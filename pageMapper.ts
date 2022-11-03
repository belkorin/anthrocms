import * as fsPromises from 'fs/promises';
import express = require('express');
import { Express, Request, Response } from 'express';
import path = require('path');
import { getItems } from './data/getItems';
import { DataSource } from 'typeorm';
import { translateObject } from './data/translateToWebsiteObject';
import Eta = require('eta');
import { helpers } from './helpers';

export class pageMapper {
    static pathDef = "page_definitions";
    static pages = new Map<string, pageData>();
    static async mapPages(db: DataSource, app : express.Express) {
        const files = await fsPromises.readdir(pageMapper.pathDef, {withFileTypes: true});

        for (const file of files) {
            if(file.isFile() && file.name.endsWith(".json")) {
                const fileText = await (await fsPromises.readFile(path.join(pageMapper.pathDef, file.name))).toString();
                const page = JSON.parse(fileText) as pageData;

                this.pages.set(page.page, page);

                app.get(`/${page.page}`, async function(req: Request, res: Response) {

                    const template = "<%~ includeFile('./main.eta', it) %>"
                  
                    const items = (await getItems.getItems(db, page.categories, page.itemTypes, page.tags));
                    const translatedItems = Array.from(translateObject.toWebsiteObject(items).values());
                    const it = { 
                      banner: page.banner, 
                      bannerAlt: page.bannerAlt, 
                      gridItemClass: page.gridItemClass,
                      pageTemplate: `${page.pageType}.eta`,
                      additionalClasses: [`${page.pageTheme}-grid-content`],
                      theme: page.pageTheme,
                      formatPrice: helpers.formatPrice,
                      data: translatedItems };
                  
                    const rendered = Eta.render(template, it);
                  
                    res.send(rendered);
                    
                  })
            }
        }
    }
    static async getPreviewData(db: DataSource, previewPage : string) {
        const page = this.pages.get(previewPage);

        const items = await helpers.getSuggestions(db, page.categories[0], 3);

        return { 
            banner: page.banner, 
            bannerAlt: page.bannerAlt, 
            gridItemClass: page.gridItemClass,
            themeDesc: page.themeDesc,
            page: page.page,
            additionalClasses: [`${page.pageTheme}-grid-content`],
            theme: page.pageTheme,
            formatPrice: helpers.formatPrice,
            data: items };

    }
}

class pageData {
    page: string;
    banner: string;
    bannerAlt: string; 
    gridItemClass: string;
    pageTheme: string;
    themeDesc: string;
    pageType: string;
    categories?: string[]
    itemTypes?: string[]
    tags?: string[]
}