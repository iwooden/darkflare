import { AppDataSource } from "../data-source"
import { Party } from "../entity/Party"
import { PartyCreate, PartyDelete, PartyQuery } from "../validator/PartyValidators"
import { ReqBody, ReqQuery } from "../util/reqTypes"

export class PartyController {

    private partyRepository = AppDataSource.getRepository(Party)

    async query(req: ReqQuery<PartyQuery>) {
        const q = req.query
        return this.partyRepository.findBy(q)
    }

    async create(req: ReqBody<PartyCreate>) {
        const q = req.body

        const party = Object.assign(new Party(), q)

        return this.partyRepository.save(party);
    }

    async remove(req: ReqBody<PartyDelete>) {
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
