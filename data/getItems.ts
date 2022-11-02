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
        if(catsWithSubcats != null) {
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

        if(types != null) {
            queryBuilder.andWhere("itemType.typeName in (:...typeName)", {typeName: types});
        }
        if(tags != null) {
            queryBuilder.andWhere("tags.tagName in (:...filterTags)", {filterTags: tags});
        }

        const filteredItems = await queryBuilder.getMany();

        return filteredItems;
    }
}