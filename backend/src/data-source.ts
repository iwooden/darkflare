import "reflect-metadata"
import { DataSource } from "typeorm"
import { Character } from "./entity/Character"
import { Span } from "./entity/Span"
import { Party } from "./entity/Party"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "",
    database: "darkflare",
    useUTC: true,
    synchronize: true,
    logging: false,
    entities: [Party, Character, Span],
    migrations: [],
    subscribers: [],
})
