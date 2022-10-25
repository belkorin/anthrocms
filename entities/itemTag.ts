import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from "typeorm"
import { item } from "./item.js"

@Entity()
export class itemTag {
    @PrimaryGeneratedColumn()
    tagID: number

    @Column()
    tagName: string

    @ManyToMany(() => item, (item) => item.itemTags)
    items: item[];

    public constructor(init?:Partial<itemTag>) {
        Object.assign(this, init);
    }
}