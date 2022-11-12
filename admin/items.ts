import { DataSource, FindOptionsUtils } from "typeorm";
import { getItems } from "../data/getItems";

import Eta = require('eta')
import { item } from "../entities/item";
import { itemSubCategory } from "../entities/itemSubCategory";
import { itemCategory } from "../entities/itemCategory";
import { itemType } from "../entities/itemType";
import { itemTag } from "../entities/itemTag";

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
                                <% if(item[prop] == null) { %> 
                                    <td>&gt;not set&lt;</td> 
                                <% } else if(item[prop].typeName) { %> 
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
        const i = await getItems.getItemByGeneratedID(db, itemID);

        const cats = await db.getRepository(itemCategory).createQueryBuilder("cat")
                                    .leftJoinAndSelect("cat.subCategories", "subCat")
                                    .getMany();
        const subCatsByCat = new Map(cats.map((c) => [c.catID, c]));
        const jsonCats = JSON.stringify(Array.from(subCatsByCat));

        const types = await db.getRepository(itemType).createQueryBuilder("type")
                                    .getMany();
        const tags = await db.getRepository(itemTag).createQueryBuilder("tags")
                                    .getMany();

        const jsonTags = JSON.stringify(tags);

        let template = `
        <html>
            <head>
                <script type="text/javascript" src="/scripts/editItem.js"></script>
                <script type="text/javascript">
                    window.catMap = JSON.parse('<%~ it.jsonCats %>');
                    window.itemTags = JSON.parse('<%~ it.jsonTags %>');
                </script>
            </head>
            <body>
                <form action="/admin/save?id=<%= it.item["generatedID"] %>" method="post">
                <table>
                <% Object.keys(it.item).forEach(function(prop) { %>
                    <% if(it.item[prop] == null) { return; } %> 
                    <tr><td>
                    <%= prop %>:</td>
                    <td>
                    <% if(it.item[prop].typeName) { %> 
                        <select id="<%= prop %>" name="<%= prop %>">
                            <% it.itemTypes.forEach(function(t) { %>
                                <option value="<%=t.typeID%>"<%if(t.typeID == it.item.itemType.typeID) {%> selected<%}%>><%=t.typeName%></option>
                            <%})%>
                        </select>
                    <% } else if(prop == "generatedID") { %> 
                        <%= it.item[prop] %>
                    <% } else if(it.item[prop].catName) { %> 
                        <%= it.item[prop].catName %>
                    <% } else if(it.item[prop].subCatName) { %> 
                        <%= it.item[prop].subCatName %>
                    <% } else if(prop == "itemTags") { %>
                        <input type="hidden" id="tagsList" name="tagsList" value="<%=it.item[prop].map((x) => x.tagName).join(',')%>">
                        <table id="tagsTable">
                        <% it.item[prop].forEach(function(tag) { %>
                            <tr>
                            <td><%= tag.tagName %></td><td><a href="#removeTag<%=tag.tagID%>" onClick="removeTag(); return false;">remove</a></td>
                            </tr>
                        <% }) %>
                        <tr><td><a href="#addTag" onClick="addTag(); return false;">add tag</a></td></tr>
                        </table>
                    <% } else {  %>
                        <input type="text" id="<%= prop %>" name="<%= prop %>" value ="<%= it.item[prop] %>" />
                    <% } %>
                    </td>
                    </tr>
                <% }) %>
                </table>
                <input type="submit">
                </form>
            </body>
        </html>
        `

        const result = Eta.render(template, {itemCats: cats, itemTypes: types, jsonCats: jsonCats, jsonTags: jsonTags, item: i});

        return result;
    }
}