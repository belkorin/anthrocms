import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm"
import { item } from "./item.js"

@Entity()
export class itemType {
    @PrimaryGeneratedColumn()
    typeID: number

    @Column()
    typeName: string

    @OneToMany(() => item, (item) => item.itemType)
    items: item[];

    public constructor(init?:Partial<itemType>) {
        Object.assign(this, init);
    }
}