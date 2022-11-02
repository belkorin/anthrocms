import { DataSource, FindOptionsUtils } from "typeorm";
import { getItems } from "../data/getItems";

import Eta = require('eta')
import { item } from "../entities/item";

export class items {
    static async renderGetItems(db : DataSource) {
        const items = await getItems.getItems(db);

        const propNames = Object.getOwnPropertyNames(items[0]);

        let template = `
        <html>
            <body>
                <table>
                    <tr>
                        <% it.props.forEach(function(prop){ %>
                            <td><%= prop %></td>
                        <% }) %>
                        <td></td><td></td>
                    </tr>
                    <% it.items.forEach(function(item){ %>
                        <tr>
                            <% Object.keys(item).forEach(function(prop) { %>
                                <% if(item[prop].typeName) { %> 
                                    <td><%= item[prop].typeName %></td> 
                                <% } else if(item[prop].catName) { %> 
                                    <td><%= item[prop].catName %></td> 
                                <% } else if(item[prop].subCatName) { %> 
                                    <td><%= item[prop].subCatName %></td> 
                                <% } else if(Array.isArray(item[prop])) { %> 
                                    <td><%= item[prop].map((x) => x.tagName).join(',') %></td> 
                                <% } else {  %>
                                    <td><%= item[prop] %></td>
                                <% } %>
                            <% }) %>
                            <td><a href="/admin/edit?id=<%= item["generatedID"] %>">Edit</a></td><td><a href="/admin/delete?id=<%= item["generatedID"] %>">Delete</a></td>
                        </tr>    
                    <% }) %>
                </table>
            </body>
        </html>
        `
        
        return Eta.render(template, {props: propNames, items: items});
    }

    static async renderEditItem(db : DataSource, itemID : number) {
        const i = await db.getRepository(item).findOne({
            where: {
                generatedID: itemID
            },
        });

        let template = `
        <html>
            <body>
                <form action="/admin/save?id=<%= it.item["generatedID"] %>" method="post">
                <% Object.keys(it.item).forEach(function(prop) { %>
                    <%= prop %>:
                    <% if(it.item[prop].typeName) { %> 
                        <%= it.item[prop].typeName %> 
                    <% } else if(prop == "generatedID") { %> 
                        <%= it.item[prop] %>
                    <% } else if(it.item[prop].catName) { %> 
                        <%= it.item[prop].catName %>
                    <% } else if(it.item[prop].subCatName) { %> 
                        <%= it.item[prop].subCatName %>
                    <% } else if(Array.isArray(it.item[prop])) { %> 
                        <%= it.item[prop].map((x) => x.tagName).join(',') %>
                    <% } else {  %>
                        <input type="text" id="<%= prop %>" value ="<%= it.item[prop] %>" />
                    <% } %>
                    <br />
                <% }) %>
                <input type="submit">
                </form>
            </body>
        </html>
        `

        return Eta.render(template, {item: i});
    }
}