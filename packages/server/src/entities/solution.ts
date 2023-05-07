import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { type SqlLevel } from './level';

@Entity({ tableName: 'solution' })
export class SqlSolution {
  @PrimaryKey()
  id!: string;

  @ManyToOne()
  level!: SqlLevel;

  @Property({ type: 'json' })
  path!: any;
}
