import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import { SqlEntity } from './sql-entity';
import { SqlLevel } from './sql-level';

@Entity({ tableName: 'session' })
export class SqlSession extends SqlEntity {
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
