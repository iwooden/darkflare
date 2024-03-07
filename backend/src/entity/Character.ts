import { OneToMany, Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Span } from "./Span"
import { Party } from "./Party"
import { IPostgresInterval } from "postgres-interval"

@Entity()
export class Character {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({
        type: 'interval',
        default: '0'
    })
    age: IPostgresInterval

    @Column({ default: 0 })
    nextSpanOrder: number

    @Column()
    partyId: number

    @ManyToOne(() => Party, (party) => party.characters, {
        onDelete: "CASCADE"
    })
    party: Party

    @OneToMany(() => Span, (span) => span.character, {
        cascade: true
    })
    spans: Span[]
}
