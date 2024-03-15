import { AppDataSource } from "../data-source";
import { Universe } from "../entity/Universe";
import {
  UniverseCreate,
  UniverseDelete,
  UniverseQuery,
} from "../validator/UniverseValidators";
import { ReqBody, ReqQuery } from "../util/reqTypes";

export class UniverseController {
  private universeRepository = AppDataSource.getRepository(Universe);

  async query(req: ReqQuery<UniverseQuery>) {
    const q = req.query;
    return this.universeRepository.findBy(q);
  }

  async create(req: ReqBody<UniverseCreate>) {
    const q = req.body;

    const universe = this.universeRepository.merge(new Universe(), q);

    return this.universeRepository.save(universe);
  }

  async remove(req: ReqBody<UniverseDelete>) {
    const q = req.body;

    const universe = await this.universeRepository.findOneBy(q);

    if (universe) {
      await this.universeRepository.remove(universe);
      return `removed universe with id ${q.id}`;
    } else {
      return `no universe with id ${q.id} found`;
    }
  }
}
