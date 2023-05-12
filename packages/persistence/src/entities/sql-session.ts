import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { SqlLevel } from './sql-level';

@Entity({ tableName: 'session' })
export class SqlSession {
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
