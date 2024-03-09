import { AppDataSource } from "../data-source"
import { Request } from "express"
import { Character } from "../entity/Character"
import { Event, EventType } from "../entity/Event"
import { Between, LessThan, MoreThan } from "typeorm"
import { DateTime, Duration, Interval } from "luxon"
import * as parse from "postgres-interval"
import { SpanLevelTable } from "../util/spanLevelTable"

interface EventQuery {
    id: number | undefined,
    charId: number | undefined,
    order: number | undefined,
    timeStart: string | undefined,
    timeEnd: string | undefined,
    orderStart: number | undefined,
    orderEnd: number | undefined
}

interface EventCreate {
    characterId: number,
    fromTime: string,
    toTime: string,
    timezone: string,
    location: string,
    notes: string | undefined,
    type: EventType
}

interface EventDelete {
    characterId: number,
    count: number
}

export class EventController {

    private spanRepository = AppDataSource.getRepository(Event)
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

        return this.spanRepository.findBy(findArgs)
    }

    async create(req: Request<unknown, unknown, EventCreate, unknown>) {
        const q = req.body
        const char = await this.charRepository.findOneBy({ id: q.characterId });

        if (!char) {
            return `no char found for id ${q.characterId}`
        }

        // Get last span to update char age
        const lastSpan = await this.spanRepository.findOne({
            where: {
                characterId: q.characterId
            },
            order: {
                order: 'DESC'
            }
        })


        // Calculate age increment for char
        let age = Duration.fromISO(char.age.toISO())

        if (lastSpan) {
            const start = DateTime.fromJSDate(lastSpan.toTime, { zone: 'UTC' })
            const end = DateTime.fromISO(q.fromTime)

            const addedAge = Interval.fromDateTimes(start, end).toDuration()

            age = age.plus(addedAge).normalize()
        }

        // Calculate span remaining for char
        let spanRemaining = Duration.fromISO(char.remainingSpan.toISO())

        // Convert to postgres-interval
        // Hacky but postgres-interval can't be constructed from ISO 8601 strings
        const pgInterval = Object.assign(parse(""), age.toObject())

        // Update span order number & age for char
        await this.charRepository.update({
            id: q.characterId,
        }, {
            nextSpanOrder: char.nextSpanOrder + 1,
            age: pgInterval
        })

        const span = Object.assign(new Event(), q, {
            character: char,
            order: char.nextSpanOrder,
            charAge: pgInterval
        })
        return await this.spanRepository.save(span)
    }

    async remove(req: Request<unknown, unknown, EventDelete, unknown>) {
        const q = req.body
        const char = await this.charRepository.findOneBy({ id: q.characterId });

        if (!char) {
            return `no char found for id ${q.characterId}`
        }

        const spansToRemove = await this.spanRepository.find({
            order: {
                order: 'DESC'
            },
            take: q.count
        })

        await this.spanRepository.remove(spansToRemove)

        return `removed ${spansToRemove.length} spans for ${q.characterId}`
    }
}
