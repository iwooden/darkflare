import { z } from "zod"
import { EventType } from "../entity/Event"
import { timeZoneSet } from "../util/timezoneDict"
import { body, query } from "../util/validationFormatters"

const EventQuery = z.object({
    id: z.number().optional(),
    characterId: z.number().optional(),
    order: z.number().optional(),
    timeStart: z.string().datetime().optional(),
    timeEnd: z.string().datetime().optional(),
    orderStart: z.number().min(0).optional(),
    orderEnd: z.number().optional()
}).strict()
export const EventQueryValidator = query(EventQuery)
export type EventQuery = z.infer<typeof EventQuery>

const EventCreate = z.object({
    characterId: z.number(),
    time: z.string().datetime(),
    toTime: z.string().datetime().optional(),
    timezone: z.string().refine((s) => {
        return timeZoneSet.has(s)
    }),
    toTimezone: z.string().refine((s) => {
        return timeZoneSet.has(s)
    }).optional(),
    location: z.string(),
    toLocation: z.string().optional(),
    notes: z.string().optional(),
    type: z.nativeEnum(EventType)
}).strict()
export const EventCreateValidator = body(EventCreate.superRefine((o, ctx) => {
    if (o.type === EventType.SpanTime) {
        if (!o.toTime)
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Must specify toTime when eventType is spanTime'
            })
        if (!o.toTimezone)
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Must specify toTimezone when eventType is spanTime'
            })
        if (!o.toLocation)
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Must specify toLocation when eventType is spanTime'
            })
    }
}))
export type EventCreate = z.infer<typeof EventCreate>

const EventDelete = z.object({
    characterId: z.number(),
    count: z.number()
}).strict()
export const EventDeleteValidator = body(EventDelete)
export type EventDelete = z.infer<typeof EventDelete>
