import { AppDataSource } from "../data-source"
import { Request } from "express"
import { Party } from "../entity/Party"

interface PartyQuery {
    id: number | undefined,
    name: string | undefined,
}

interface PartyCreate {
    name: string,
}

interface PartyDelete {
    id: number,
}

export class PartyController {

    private partyRepository = AppDataSource.getRepository(Party)

    async query(req: Request<unknown, unknown, unknown, PartyQuery>) {
        const q = req.query
        return this.partyRepository.findBy(q)
    }

    async create(req: Request<unknown, unknown, PartyCreate, unknown>) {
        const q = req.body

        const party = Object.assign(new Party(), q)

        return this.partyRepository.save(party);
    }

    async remove(req: Request<unknown, unknown, PartyDelete, unknown>) {
        const q = req.body

        const party = await this.partyRepository.findOneBy(q);

        if (party) {
            await this.partyRepository.remove(party)
            return `removed party with id ${q.id}`
        } else {
            return `no party with id ${q.id} found`
        }
    }
}
