import { OneToMany, Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Range } from "./Range";
import { Event } from "./Event";

@Entity()
export class Universe {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => Range, (range) => range.universe, {
    cascade: true,
  })
  ranges!: Range[];

  @OneToMany(() => Event, (event) => event.universe, {
    cascade: true,
  })
  events!: Event[];
}
