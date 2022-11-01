import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from "typeorm"
import { item } from "./item";

@Entity()
export class itemTag {
    @PrimaryGeneratedColumn()
    tagID: number

    @Column()
    tagName: string

    @ManyToMany(() => item, (item) => item.itemTags)
    @JoinTable()
    items: item[];

    public constructor(init?:Partial<itemTag>) {
        Object.assign(this, init);
    }
}