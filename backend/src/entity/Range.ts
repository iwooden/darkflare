/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Interval } from "luxon";
import {
  Unique,
  OneToMany,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from "typeorm";
import { pgIntervalTransform } from "../util/pgUtils";
import { Character } from "./Character";
import { Event } from "./Event";
import { Universe } from "./Universe";

@Entity()
@Unique(["character", "order"])
// Created custom GIST index for timerange column in first migration
// Tell typeorm to ignore it
@Index("tsrange_idx", { synchronize: false })
export class Range {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  characterId!: number;

  @ManyToOne(() => Character, (character) => character.events, {
    onDelete: "CASCADE",
  })
  character!: Character;

  @Column()
  universeId!: number;

  @ManyToOne(() => Universe, (universe) => universe.ranges, {
    onDelete: "CASCADE",
  })
  universe!: Universe;

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
