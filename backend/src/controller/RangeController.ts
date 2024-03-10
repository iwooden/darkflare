import { AppDataSource } from "../data-source"
import { PartyCreate, PartyDelete, PartyQuery } from "../validator/PartyValidators"
import { ReqBody, ReqQuery } from "../util/reqTypes"
import { Range } from "../entity/Range"
import { Character } from "../entity/Character"
import { RangeQuery } from "../validator/RangeValidators"

export class RangeController {

    private rangeRepository = AppDataSource.getRepository(Range)

    async query(req: ReqQuery<RangeQuery>) {
        const q = req.query

        const range = await this.rangeRepository.findBy(q)

        return range
    }
}
