import { Duration } from "luxon"

// Default spans from Continuum up to Exalted
export const SpannerLevelTable: { [k: number]: Duration } = {
    0: Duration.fromISO('P0Y'),
    1: Duration.fromISO('P1Y'),
    2: Duration.fromISO('P10Y'),
    3: Duration.fromISO('P100Y'),
    4: Duration.fromISO('P1000Y'),
    5: Duration.fromISO('P10000Y'),
}
