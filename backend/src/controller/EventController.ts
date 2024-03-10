import { AppDataSource } from "../data-source"
import { Response } from "express"
import { Character } from "../entity/Character"
import { Event, EventType } from "../entity/Event"
import { Range } from "../entity/Range"
import { Between, LessThan, MoreThan } from "typeorm"
import { DateTime, Duration, Interval } from "luxon"
import { SpannerLevelTable } from "../util/spannerLevelTable"
import { EventCreate, EventDelete, EventQuery } from "../validator/EventValidators"
import { ReqBody, ReqQuery } from "../util/reqTypes"

export class EventController {

    private eventRepository = AppDataSource.getRepository(Event)
    private charRepository = AppDataSource.getRepository(Character)
    private rangeRepository = AppDataSource.getRepository(Range)

    async query(req: ReqQuery<EventQuery>) {
        const q = req.query
        const findArgs: any = {
            id: q.id,
            order: q.order,
            characterId: q.characterId
        }

        if (q.timeStart && q.timeEnd) {
            findArgs.toTime = Between(q.timeStart, q.timeEnd)
        } else {
            if (q.timeStart) {
                findArgs.toTime = MoreThan(q.timeStart)
            }
            if (q.timeEnd) {
                findArgs.toTime = LessThan(q.timeEnd)
            }
        }

        if (q.orderStart && q.orderEnd) {
            findArgs.order = Between(q.orderStart, q.orderEnd)
        } else {
            if (q.orderStart) {
                findArgs.order = MoreThan(q.orderStart)
            }
            if (q.orderEnd) {
                findArgs.order = LessThan(q.orderEnd)
            }
        }

        return this.eventRepository.findBy(findArgs)
    }

    async create(req: ReqBody<EventCreate>, res: Response) {
        const q = req.body

        // Annoying validation here for spanTime
        // Zod doesn't allow refining without turning zodObject -> zodEffect,
        // which breaks all the nice type inference stuff
        if (q.type === EventType.SpanTime) {
            if (!q.toTime || !q.toTimezone || !q.toLocation) {
                res.statusCode = 400
                return "Need to specify toTime, toTimezone and toLocation for type spanTime"
            }
        }

        const char = await this.charRepository.findOneBy({ id: q.characterId });

        if (!char) {
            res.statusCode = 400
            return `no char found for id ${q.characterId}`
        }

        // May be modified depending on event type
        let eventOrder = char.nextSpanOrder
        let rangeOrder = char.nextRangeOrder
        let age = char.age
        let remainingSpan = char.remainingSpan
        let secondEventArgs: any = {}

        // Get last event to update char age
        const lastEvent = await this.eventRepository.findOne({
            where: {
                characterId: q.characterId
            },
            order: {
                order: 'DESC'
            }
        })

        // Calculate age increment for char
        if (lastEvent) {
            const start = DateTime.fromJSDate(lastEvent.time, {zone: 'UTC'})
            const end = DateTime.fromISO(q.time, {zone: 'UTC'})

            const addedAge = Interval.fromDateTimes(start, end).toDuration()

            age = age.plus(addedAge)
        } else {
            //First event should be 'birth' type to establish age
            if (q.type !== EventType.Birth) {
                res.statusCode = 400
                return `first event for char ${q.characterId} should be type 'birth'`
            }
        }

        let lastRange = await this.rangeRepository.findOne({
            where: {
                characterId: q.characterId
            },
            order: {
                order: 'DESC'
            }
        })

        // Create initial range if one doesn't exist
        if (!lastRange) {
            const start = DateTime.fromISO(q.time)
            const initRange = Interval.fromDateTimes(start, start)
            lastRange = await this.rangeRepository.save(Object.assign(new Range(), q, {
                timerange: initRange,
                order: rangeOrder
            }))
        }

        // Event type handlers
        switch (q.type) {
            case EventType.RestEnd: {
                // If char finished resting, reset remaining span
                remainingSpan = SpannerLevelTable[char.spannerLevel]
                break;
            }
            case EventType.SpanTime: {
                // Calculate reminaing span
                const start = DateTime.fromISO(q.time)
                const end = DateTime.fromISO(q.toTime!)

                let spanUsed: Duration;
                if (start < end) {
                    spanUsed = Interval.fromDateTimes(start, end).toDuration()
                } else {
                    spanUsed = Interval.fromDateTimes(end, start).toDuration()
                }

                remainingSpan = remainingSpan.minus(spanUsed)

                // Create time travel "from" event
                await this.eventRepository.save(Object.assign(new Event(), q, {
                    character: char,
                    charAge: age,
                    charRemainingSpan: remainingSpan,
                    charSpannerLevel: char.spannerLevel,
                    order: eventOrder
                }))

                // Increment span order
                eventOrder += 1

                // Create args for "bookend" event
                Object.assign(secondEventArgs, {
                    time: q.toTime,
                    fromTime: q.time,
                    toTime: null,
                    timezone: q.toTimezone,
                    fromTimezone: q.timezone,
                    toTimezone: null,
                    location: q.toLocation,
                    fromLocation: q.location,
                    toLocation: null
                })
                break;
            }
        }

        // Increment span order, apply age/remaining span changes
        await this.charRepository.update({
            id: q.characterId,
        }, {
            nextSpanOrder: eventOrder + 1,
            age: age,
            remainingSpan: remainingSpan
        })

        const event = Object.assign(new Event(), q, {
            charAge: age,
            charRemainingSpan: remainingSpan,
            charSpannerLevel: char.spannerLevel,
            order: eventOrder
        }, secondEventArgs)
        return this.eventRepository.save(event)
    }

    async remove(req: ReqBody<EventDelete>) {
        const q = req.body
        const char = await this.charRepository.findOneBy({ id: q.characterId });

        if (!char) {
            return `no char found for id ${q.characterId}`
        }

        const spansToRemove = await this.eventRepository.find({
            order: {
                order: 'DESC'
            },
            take: q.count
        })

        await this.eventRepository.remove(spansToRemove)

        return `removed ${spansToRemove.length} spans for ${q.characterId}`
    }
}
