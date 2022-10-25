import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm"
import { itemCategory } from "./itemCategory.js";
import { itemSubCategory } from "./itemSubCategory.js";
import { itemTag } from "./itemTag.js";
import { itemType } from "./itemType.js";

@Entity()
export class item {
    @PrimaryGeneratedColumn()
    generatedID: number

    @Column()
    itemCategoryID: number;
    @Column()
    itemSubcategoryID: number;
    @Column()
    itemID: number;
    @Column()
    name: string;
    @Column()
    shortDescription: string;
    @Column()
    longDescription?: string;
    @Column()
    price: number;
    @Column()
    inStock: boolean;
    @ManyToOne(() => itemType, (itemType) => itemType.typeID)
    itemType: itemType;
    @ManyToOne(() => itemCategory, (itemCategory) => itemCategory.catID)
    itemCategory: itemCategory;
    @ManyToOne(() => itemSubCategory, (itemSubCategory) => itemSubCategory.subCatID)
    itemSubCategory: itemSubCategory;

    @ManyToMany(() => itemTag, (tag) => tag.items)
    @JoinTable()
    itemTags: itemTag[];

    
    public constructor(init?:Partial<item>) {
        Object.assign(this, init);
    }
}