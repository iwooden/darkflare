import {
  OneToMany,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from "typeorm";
import { Event } from "./Event";
import { Party } from "./Party";
import { Range } from "./Range";
import { displayDuration, pgDurationTransform } from "../util/pgUtils";
import { Duration } from "luxon";

@Entity()
export class Character {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({
    type: "interval",
    transformer: pgDurationTransform,
  })
  age!: Duration;

  @Column({
    type: "interval",
    transformer: pgDurationTransform,
  })
  remainingSpan!: Duration;

  @Column({ default: 0 })
  spannerLevel!: number;

  @Column({ default: 0 })
  nextSpanOrder!: number;

  @Column({ default: 0 })
  nextRangeOrder!: number;

  @Column()
  partyId!: number;

  @ManyToOne(() => Party, (party) => party.characters, {
    onDelete: "CASCADE",
  })
  party!: Party;

  @OneToMany(() => Event, (event) => event.character, {
    cascade: true,
  })
  events!: Event[];

  @OneToMany(() => Range, (range) => range.character, {
    cascade: true,
  })
  ranges!: Range[];

  // Display to user
  toJSON() {
    const obj: any = this;
    obj.age = displayDuration(this.age);
    obj.remainingSpan = displayDuration(this.remainingSpan);
    return obj;
  }
}
