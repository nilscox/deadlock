import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { SqlLevel } from './level';

@Entity({ tableName: 'level_session' })
export class SqlLevelSession {
  @PrimaryKey()
  id!: string;

  @Property()
  date!: Date;

  @Property()
  ip!: string;

  @ManyToOne()
  level!: SqlLevel;

  @Property()
  completed!: boolean;

  @Property()
  tries!: number;

  @Property()
  time!: number;
}
