import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from "typeorm"
import { itemCategory } from "./itemCategory";
import { itemSubCategory } from "./itemSubCategory";
import { itemTag } from "./itemTag";
import { itemType } from "./itemType";

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
    itemTags?: itemTag[];

    
    public constructor(init?:Partial<item>) {
        Object.assign(this, init);
    }
}