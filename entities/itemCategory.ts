import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm"
import { item } from "./item.js"
import { itemSubCategory } from "./itemSubCategory.js";

@Entity()
export class itemCategory {
    @PrimaryGeneratedColumn()
    catID: number

    @Column()
    catName: string

    @OneToMany(() => item, (item) => item.itemCategory, {cascade: true})
    items: item[];

    @OneToMany(() => itemSubCategory, (subCat) => subCat.itemCategory, {cascade: true})
    subCategories: itemSubCategory[];

    public constructor(init?:Partial<itemCategory>) {
        Object.assign(this, init);
    }
}