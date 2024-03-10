import { AppDataSource } from "../data-source"
import { Response } from "express"
import { Character } from "../entity/Character"
import { Event, EventType } from "../entity/Event"
import { Between, LessThan, MoreThan } from "typeorm"
import { DateTime, Duration, Interval } from "luxon"
import { SpannerLevelTable } from "../util/spannerLevelTable"
import { durationToPg } from "../util/durationToPG"
import { EventCreate, EventDelete, EventQuery } from "../validator/EventValidators"
import { ReqBody, ReqQuery } from "../util/reqTypes"

export class EventController {

    private eventRepository = AppDataSource.getRepository(Event)
    private charRepository = AppDataSource.getRepository(Character)

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

        // Increment this as needed
        let eventOrder = char.nextSpanOrder

        // Used if second event needed
        let secondEventArgs: any = {}

        // Get last span to update char age
        const lastEvent = await this.eventRepository.findOne({
            where: {
                characterId: q.characterId
            },
            order: {
                order: 'DESC'
            }
        })

        // Calculate age increment for char
        let age = Duration.fromISO(char.age.toISO())

        if (lastEvent) {
            const start = DateTime.fromJSDate(lastEvent.time)
            const end = DateTime.fromISO(q.time)

            const addedAge = Interval.fromDateTimes(start, end).toDuration()

            age = age.plus(addedAge)
        }

        // Calculate remaining span for char
        let remainingSpan = Duration.fromISO(char.remainingSpan.toISO())

        if (q.type === EventType.SpanTime) {
            // If char spans time, decrement reminaing span
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
                charAge: durationToPg(age),
                charRemainingSpan: durationToPg(remainingSpan),
                charSpannerLevel: char.spannerLevel,
                order: eventOrder,
                fromTime: null,
                fromTimezone: null,
                fromLocation: null
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
        }

        // If char finished resting, reset remaining span
        if (q.type === EventType.RestEnd) {
            remainingSpan = SpannerLevelTable[char.spannerLevel]
        }

        // Increment span order, apply age/remaining span changes
        await this.charRepository.update({
            id: q.characterId,
        }, {
            nextSpanOrder: eventOrder + 1,
            age: durationToPg(age),
            remainingSpan: durationToPg(remainingSpan)
        })

        const event = Object.assign(new Event(), q, {
            charAge: durationToPg(age),
            charRemainingSpan: durationToPg(remainingSpan),
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
