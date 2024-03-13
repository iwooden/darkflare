/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Interval } from "luxon";
import {
  Unique,
  OneToMany,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from "typeorm";
import { pgIntervalTransform } from "../util/pgUtils";
import { Character } from "./Character";
import { Event } from "./Event";

@Entity()
@Unique(["character", "order"])
export class Range {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  characterId!: number;

  @ManyToOne(() => Character, (character) => character.events, {
    onDelete: "CASCADE",
  })
  character!: Character;

  @OneToMany(() => Event, (event) => event.range, {
    cascade: true,
  })
  events!: Event[];

  @Column({
    type: "tsrange",
    transformer: pgIntervalTransform,
  })
  timerange!: Interval;

  @Column()
  location!: string;

  @Column()
  timezone!: string;

  @Column()
  order!: number;

  // Display to user
  toJSON() {
    const obj: any = { ...this };
    obj.timerange = obj.timerange.toISO();
    return obj;
  }
}
