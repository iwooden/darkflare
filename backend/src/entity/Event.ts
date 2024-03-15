/* eslint-disable  @typescript-eslint/no-explicit-any */
import {
  Unique,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from "typeorm";
import { Character } from "./Character";
import { displayDuration, pgDurationTransform } from "../util/pgUtils";
import { Duration } from "luxon";
import { Range } from "./Range";
import { Universe } from "./Universe";

export enum EventType {
  SpanTime = "spanTime",
  Birth = "birth",
  Death = "death",
  LocationChange = "locationChange",
  RestStart = "restStart",
  RestEnd = "restEnd",
  Other = "other",
}

@Entity()
@Unique(["character", "order"])
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  characterId!: number;

  @ManyToOne(() => Character, (character) => character.events, {
    onDelete: "CASCADE",
  })
  character!: Character;

  @Column()
  rangeId!: number;

  @ManyToOne(() => Range, (range) => range.events, {
    onDelete: "CASCADE",
  })
  range!: Range;

  @Column()
  universeId!: number;

  @ManyToOne(() => Universe, (universe) => universe.events, {
    onDelete: "CASCADE",
  })
  universe!: Universe;

  @Column({ type: "timestamp" })
  time!: Date;

  @Column({
    type: "timestamp",
    nullable: true,
  })
  toTime?: Date;

  @Column({
    type: "timestamp",
    nullable: true,
  })
  fromTime?: Date;

  @Column({
    type: "interval",
    transformer: pgDurationTransform,
  })
  charAge!: Duration;

  @Column({
    type: "interval",
    transformer: pgDurationTransform,
  })
  charRemainingSpan!: Duration;

  @Column()
  charSpannerLevel!: number;

  @Column()
  timezone!: string;

  @Column({ nullable: true })
  toTimezone?: string;

  @Column({ nullable: true })
  fromTimezone?: string;

  @Column()
  order!: number;

  @Column()
  location!: string;

  @Column({ nullable: true })
  toLocation?: string;

  @Column({ nullable: true })
  fromLocation?: string;

  @Column({ nullable: true })
  notes?: string;

  @Column({
    type: "enum",
    enum: EventType,
  })
  type!: string;

  // Display to user
  toJSON() {
    const obj: any = { ...this };
    obj.charAge = displayDuration(this.charAge);
    obj.charRemainingSpan = displayDuration(this.charRemainingSpan);
    return obj;
  }
}
