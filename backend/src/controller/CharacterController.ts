import { AppDataSource } from "../data-source"
import { Request } from "express"
import { Character } from "../entity/Character"

interface CharQuery {
    id: number | undefined,
    name: string | undefined,
}

interface CharCreate {
    name: string,
}

interface CharDelete {
    id: number,
}

export class CharacterController {

    private charRepository = AppDataSource.getRepository(Character)

    async query(req: Request<unknown, unknown, unknown, CharQuery>) {
        const q = req.query
        return this.charRepository.findBy(q)
    }

    async create(req: Request<unknown, unknown, CharCreate, unknown>) {
        const q = req.body

        const char = Object.assign(new Character(), q)

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
