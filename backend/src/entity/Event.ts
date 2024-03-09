import { Unique, Entity, PrimaryGeneratedColumn, JoinColumn, Column, ManyToOne } from "typeorm"
import { Character } from "./Character"
import { IPostgresInterval } from "postgres-interval"

export enum EventType {
    SpanTime = 'spanTime',
    SpanTele = 'spanTele',
    Birth = 'birth',
    Death = 'death',
    LocationChange = 'locationChange',
    RestStart = 'restStart',
    RestEnd = 'restEnd',
    Other = 'other',
}

@Entity()
@Unique(["character", "order"])
export class Event {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    characterId: number

    @ManyToOne(() => Character, (character) => character.events, {
        onDelete: "CASCADE"
    })
    character: Character

    @Column({ type: 'timestamp' })
    time: Date

    @Column({
        type: 'timestamp',
        nullable: true
    })
    toTime: Date

    @Column({ type: 'interval' })
    charAge: IPostgresInterval

    @Column({ type: 'interval' })
    charRemainingSpan: IPostgresInterval

    @Column()
    charSpanLevel: number

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
        enum: EventType,
    })
    type: string
}
