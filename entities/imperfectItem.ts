import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import { item } from "./item";

@Entity()
export class imperfectItem {
    @PrimaryGeneratedColumn()
    generatedID: number;
    @ManyToOne(() => item, (item) => item.generatedID)
    parentItem: item;
    @Column()
    defectDescription: string;
    @Column()
    inStock: boolean;

    public constructor(init?:Partial<imperfectItem>) {
        Object.assign(this, init);
    }
}