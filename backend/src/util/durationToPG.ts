import { Duration } from "luxon"
import { IPostgresInterval } from "postgres-interval"
import * as parse from "postgres-interval"

export const durationToPg = (duration: Duration): IPostgresInterval => {
    // Convert Luxon duration to postgres-interval
    // Hacky but postgres-interval can't be constructed from ISO 8601 strings
    return Object.assign(parse(""), duration.toObject())
}
