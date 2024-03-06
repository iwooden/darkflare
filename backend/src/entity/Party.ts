import { OneToMany, Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import { Character } from "./Character"

@Entity()
export class Party {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @OneToMany(() => Character, (char) => char.party, {
        cascade: true
    })
    characters: Character[]
}
