import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from "typeorm"
import { item } from "./item.js"
import { itemCategory } from "./itemCategory.js";

@Entity()
export class itemSubCategory {
    @PrimaryGeneratedColumn()
    subCatID: number

    @Column()
    subCatName: string

    @OneToMany(() => item, (item) => item.itemSubCategory, {cascade: true})
    items: item[];

    @ManyToOne(() => itemCategory, (cat) => cat.catID)
    itemCategory: itemCategory;
    
    public constructor(init?:Partial<itemSubCategory>) {
        Object.assign(this, init);
    }
}