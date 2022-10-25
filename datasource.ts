import { DataSource } from "typeorm"

export const myDataSource = new DataSource({
    type: "sqlite",
    database: "db.sqlite",
    entities: ["entities/*.ts"],
    logging: true,
    synchronize: true,
    migrations: ["migrations/*.ts"]
})
