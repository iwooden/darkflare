import "reflect-metadata"
import { DataSource } from "typeorm"
import { Character } from "./entity/Character"
import { Event } from "./entity/Event"
import { Party } from "./entity/Party"
import { Range } from "./entity/Range"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT!),
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: "darkflare",
    useUTC: true,
    synchronize: true,
    logging: false,
    entities: [Party, Character, Event, Range],
    migrations: [],
    subscribers: [],
})
