import { Unique, Entity, PrimaryGeneratedColumn, JoinColumn, Column, ManyToOne } from "typeorm"
import { Character } from "./Character"

export enum SpanType {
    SpanTime = 'spanTime',
    SpanLevel = 'spanLevel',
    Birth = 'birth',
    LocationChange = 'locationOnly',
    Rest = 'rest',
    Notes = 'notes',
    Death = 'death'
}

@Entity()
@Unique(["character", "order"])
export class Span {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    characterId: number

    @ManyToOne(() => Character, (character) => character.spans, {
        onDelete: "CASCADE"
    })
    character: Character

    @Column({ type: 'timestamp' })
    fromTime: Date

    @Column({ type: 'timestamp' })
    toTime: Date

    @Column()
    timezone: string

    @Column()
    order: number

    @Column()
    location: string

    @Column({ nullable: true })
    notes: string

    @Column({
        type: 'enum',
        enum: SpanType,
        default: SpanType.SpanTime
    })
    type: string
}
