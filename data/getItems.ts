import { Brackets, DataSource } from "typeorm";
import { item } from "../entities/item";

export class getItems {
    static async getItems(datasource: DataSource, catsWithSubcats?: string[], types: string[] = null, tags: string[] = null) : Promise<item[]> {
        const items = datasource.getRepository(item);

        const queryBuilder = items.createQueryBuilder("item").where('1 = 1')
                                .leftJoinAndSelect("item.itemType", "itemType")
                                .leftJoinAndSelect("item.itemCategory", "itemCategory")
                                .leftJoinAndSelect("item.itemSubCategory", "itemSubCategory")
                                .leftJoinAndSelect("item.itemTags", "tags");
        if(catsWithSubcats != null && catsWithSubcats.length > 0) {
            queryBuilder.andWhere(new Brackets((qb) => {
                let i = 0;
                for (const catSubcat of catsWithSubcats) {
                    const catAndSubcat = catSubcat.split('-').map((x) => Number(x));
                    qb.orWhere(`(item.itemCategoryID = :catID${i} and item.itemSubcategoryID = :subcatID${i})`);
                    queryBuilder.setParameter(`catID${i}`, catAndSubcat[0]);
                    queryBuilder.setParameter(`subcatID${i}`, catAndSubcat[1]);
                    i++;
                }
            }));
        }

        if(types != null && types.length > 0) {
            queryBuilder.andWhere("itemType.typeName in (:...typeName)", {typeName: types});
        }
        if(tags != null && tags.length > 0) {
            queryBuilder.andWhere("tags.tagName in (:...filterTags)", {filterTags: tags});
        }

        const filteredItems = await queryBuilder.getMany();

        return filteredItems;
    }

    static async getItem(datasource: DataSource, itemID : string) {
        const items = datasource.getRepository(item);

        const idParts = itemID.split('-');
        const cat = Number(idParts[0]);
        const subCat = Number(idParts[1]);
        const id = Number(idParts[2]);

        var i = await items.findOne({
            where: {
                itemCategoryID: cat,
                itemSubcategoryID: subCat,
                itemID: id
            },
            relationLoadStrategy: "join",
            relations: ["itemType", "itemCategory", "itemSubCategory", "itemTags"]
        });

        return i;
    }
}