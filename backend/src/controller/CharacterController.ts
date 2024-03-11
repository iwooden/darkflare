import { AppDataSource } from "../data-source"
import { Character } from "../entity/Character"
import { Party } from "../entity/Party"
import { SpannerLevelTable } from "../util/spannerLevelTable"
import { ReqBody, ReqQuery } from "../util/reqTypes"
import { CharCreate, CharDelete, CharQuery, CharUpdate } from "../validator/CharacterValidators"
import { Duration } from "luxon"

export class CharacterController {

    private charRepository = AppDataSource.getRepository(Character)
    private partyRepository = AppDataSource.getRepository(Party)

    async query(req: ReqQuery<CharQuery>) {
        const q = req.query
        return this.charRepository.findBy(q)
    }

    async create(req: ReqBody<CharCreate>) {
        const q = req.body
        const party = await this.partyRepository.findOneBy({ id: q.partyId })

        if (!party) {
            return `no party found for id ${q.partyId}`
        }

        const remainingSpan = SpannerLevelTable[q.spannerLevel || 0];
        remainingSpan.reconfigure({ conversionAccuracy: 'longterm' })

        const char = Object.assign(new Character(), q, {
            remainingSpan: remainingSpan,
            age: Duration.fromISO('P0Y', { conversionAccuracy: 'longterm' })
        })

        return this.charRepository.save(char);
    }

    async update(req: ReqBody<CharUpdate>) {
        const q = req.body
        let char = await this.charRepository.findOneBy({ id: q.id })

        if (!char) {
            return `no char found for id ${q.id}`
        }

        char = Object.assign(char, q)

        return this.charRepository.save(char);
    }

    async remove(req: ReqBody<CharDelete>) {
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
