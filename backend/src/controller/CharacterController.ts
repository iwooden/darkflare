import { AppDataSource } from "../data-source"
import { Request } from "express"
import { Character } from "../entity/Character"
import { Party } from "../entity/Party"
import { SpannerLevelTable } from "../util/spannerLevelTable"
import { durationToPg } from "../util/durationToPG"

interface CharQuery {
    id?: number,
    name?: string,
}

interface CharCreate {
    partyId: number,
    name: string,
    spannerLevel?: number
}

interface CharDelete {
    id: number,
}

interface CharUpdate {
    id: number,
    name: string,
    spannerLevel?: number
}

export class CharacterController {

    private charRepository = AppDataSource.getRepository(Character)
    private partyRepository = AppDataSource.getRepository(Party)

    async query(req: Request<unknown, unknown, unknown, CharQuery>) {
        const q = req.query
        return this.charRepository.findBy(q)
    }

    async create(req: Request<unknown, unknown, CharCreate, unknown>) {
        const q = req.body
        const party = await this.partyRepository.findOneBy({ id: q.partyId })

        if (!party) {
            return `no party found for id ${q.partyId}`
        }

        const remainingSpan = SpannerLevelTable[q.spannerLevel || 0];

        const char = Object.assign(new Character(), q, {
            party: party,
            remainingSpan: durationToPg(remainingSpan)
        })

        return this.charRepository.save(char);
    }

    async update(req: Request<unknown, unknown, CharUpdate, unknown>) {
        const q = req.body
        let char = await this.charRepository.findOneBy({ id: q.id })

        if (!char) {
            return `no char found for id ${q.id}`
        }

        char = Object.assign(char, q)

        return this.charRepository.save(char);
    }

    async remove(req: Request<unknown, unknown, CharDelete, unknown>) {
        const q = req.body

        const char = await this.charRepository.findOneBy(q);

        if (char) {
            await this.charRepository.remove(char)
            return `removed char with id ${q.id}`
        } else {
            return `no char with id ${q.id} found`
        }
    }
}
