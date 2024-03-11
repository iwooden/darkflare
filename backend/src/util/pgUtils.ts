import { DateTime, Duration, Interval } from "luxon"
import parse, { IPostgresInterval } from "postgres-interval"

export const displayDuration = (d: Duration) => {
    return d.shiftTo(
        "years",
        "months",
        "days",
        "hours",
        "minutes",
        "seconds"
    )
}

const normalizeDurationForPG = (d: Duration) => {
    // Use only "lossless" units for DB
    return d.shiftTo(
        "days",
        "hours",
        "minutes",
        "seconds"
    )
}

const durationToPg = (d: Duration) => {
    const nd = normalizeDurationForPG(d)
    // Hacky but postgres-interval can't be constructed from ISO 8601 strings
    return Object.assign(parse(""), nd.toObject())
}

const pgToDuration = (i: IPostgresInterval) => {
    return Duration.fromISO(i.toISO(), { conversionAccuracy: 'longterm' })
}

export const pgDurationTransform = {
    from: pgToDuration,
    to: durationToPg
}

const intervalToPg = (i: Interval) => {
    const start = i.start!.toUTC().toSQL()
    const end = i.end!.toUTC().toSQL()
    return `[${start}, ${end}]`
}

const pgToInterval = (s: string) => {
    const dates = s.split(',')
    const start = DateTime.fromSQL(dates[0].slice(2,-1), {zone: 'UTC'})
    const end = DateTime.fromSQL(dates[1].slice(1,-2), {zone: 'UTC'})
    return Interval.fromDateTimes(start, end)
}

export const pgIntervalTransform = {
    from: pgToInterval,
    to: intervalToPg
}
