import { OneToMany, Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import { Span } from "./Span"

@Entity()
export class Character {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({ default: 0 })
    nextSpanOrder: number

    @OneToMany(() => Span, (span) => span.character, {
        cascade: true
    })
    spans: Span[]
}
