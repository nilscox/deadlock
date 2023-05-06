import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

type Point = [x: number, y: number];

@Entity({ tableName: 'level' })
export class SqlLevel {
  @PrimaryKey()
  id!: string;

  @Property()
  width!: number;

  @Property()
  height!: number;

  @Property({ type: 'json' })
  blocks!: Array<Point>;

  @Property({ type: 'json' })
  start!: Point;
}
