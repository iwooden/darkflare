import { Duration } from "luxon"
import { IPostgresInterval } from "postgres-interval"
import parse from "postgres-interval"

export const durationToPg = (duration: Duration): IPostgresInterval => {
    // Convert Luxon duration to postgres-interval
    // Hacky but postgres-interval can't be constructed from ISO 8601 strings
    const normalizedDur = duration.shiftTo("years", "months", "days", "hours", "minutes", "seconds")
    return Object.assign(parse(""), normalizedDur.toObject())
}
