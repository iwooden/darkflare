import { AppDataSource } from "../data-source"
import { ReqQuery } from "../util/reqTypes"
import { Range } from "../entity/Range"
import { RangeQuery } from "../validator/RangeValidators"

export class RangeController {

    private rangeRepository = AppDataSource.getRepository(Range)

    async query(req: ReqQuery<RangeQuery>) {
        const q = req.query

        const range = await this.rangeRepository.findBy(q)

        return range
    }
}
