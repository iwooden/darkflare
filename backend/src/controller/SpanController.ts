import { AppDataSource } from "../data-source"
import { Request } from "express"
import { Character } from "../entity/Character"
import { Span, SpanType } from "../entity/Span"
import { Between, LessThan, MoreThan } from "typeorm"

interface SpanQuery {
    id: number | undefined,
    charId: number | undefined,
    order: number | undefined,
    timeStart: string | undefined,
    timeEnd: string | undefined,
    orderStart: number | undefined,
    orderEnd: number | undefined
}

interface SpanCreate {
    characterId: number,
    fromTime: string,
    toTime: string,
    timezone: string,
    location: string,
    notes: string | undefined,
    type: SpanType
}

interface SpanDelete {
    characterId: number,
    count: number
}

export class SpanController {

    private spanRepository = AppDataSource.getRepository(Span)
    private charRepository = AppDataSource.getRepository(Character)

    async query(req: Request<unknown, unknown, unknown, SpanQuery>) {
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

    async create(req: Request<unknown, unknown, SpanCreate, unknown>) {
        const q = req.body
        const char = await this.charRepository.findOneBy({ id: q.characterId });

        if (!char) {
            return `no char found for id ${q.characterId}`
        }

        const span = Object.assign(new Span(), q, {
            character: char,
            order: char.nextSpanOrder
        })

        const spanSaved = await this.spanRepository.save(span)

        // Increment span order number for char
        await this.charRepository.update({
            id: q.characterId
        }, {
            nextSpanOrder: char.nextSpanOrder + 1
        })

        return spanSaved;
    }

    async remove(req: Request<unknown, unknown, SpanDelete, unknown>) {
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