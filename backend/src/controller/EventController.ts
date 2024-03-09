import { AppDataSource } from "../data-source"
import { Request } from "express"
import { Character } from "../entity/Character"
import { Event, EventType } from "../entity/Event"
import { Between, LessThan, MoreThan } from "typeorm"
import { DateTime, Duration, Interval } from "luxon"
import { SpannerLevelTable } from "../util/spannerLevelTable"
import { durationToPg } from "../util/durationToPG"

interface EventQuery {
    id?: number,
    charId?: number,
    order?: number,
    timeStart?: string,
    timeEnd?: string,
    orderStart?: number,
    orderEnd?: number
}

interface EventCreate {
    characterId: number,
    time: string,
    toTime?: string,
    timezone: string,
    location: string,
    notes?: string,
    type: EventType
}

interface EventDelete {
    characterId: number,
    count: number
}

export class EventController {

    private eventRepository = AppDataSource.getRepository(Event)
    private charRepository = AppDataSource.getRepository(Character)

    async query(req: Request<unknown, unknown, unknown, EventQuery>) {
        const q = req.query
        const findArgs: any = {
            id: q.id,
            order: q.order,
            characterId: q.charId
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

    async create(req: Request<unknown, unknown, EventCreate, unknown>) {
        const q = req.body
        const char = await this.charRepository.findOneBy({ id: q.characterId });

        if (!char) {
            return `no char found for id ${q.characterId}`
        }

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
            const start = DateTime.fromJSDate(lastEvent.time, { zone: 'UTC' })
            const end = DateTime.fromISO(q.time)

            const addedAge = Interval.fromDateTimes(start, end).toDuration()

            age = age.plus(addedAge).rescale()
        }

        // Calculate remaining span for char
        let remainingSpan = Duration.fromISO(char.remainingSpan.toISO())

        // If char spans time, decrement reminaing span
        if (q.type === EventType.SpanTime) {
            const start = DateTime.fromISO(q.time)
            const end = DateTime.fromISO(q.toTime)

            let spanUsed: Duration;
            if (start < end) {
                spanUsed = Interval.fromDateTimes(start, end).toDuration()
            } else {
                spanUsed = Interval.fromDateTimes(end, start).toDuration()
            }

            remainingSpan = remainingSpan.minus(spanUsed).rescale()
        }

        // If char finished resting, reset remaining span
        if (q.type === EventType.RestEnd) {
            remainingSpan = SpannerLevelTable[char.spannerLevel]
        }

        // Increment span order, apply age/remaining span changes
        await this.charRepository.update({
            id: q.characterId,
        }, {
            nextSpanOrder: char.nextSpanOrder + 1,
            age: durationToPg(age),
            remainingSpan: durationToPg(remainingSpan)
        })

        const event = Object.assign(new Event(), q, {
            character: char,
            order: char.nextSpanOrder,
            charAge: durationToPg(age),
            charRemainingSpan: durationToPg(remainingSpan),
            charSpannerLevel: char.spannerLevel
        })
        return this.eventRepository.save(event)
    }

    async remove(req: Request<unknown, unknown, EventDelete, unknown>) {
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
