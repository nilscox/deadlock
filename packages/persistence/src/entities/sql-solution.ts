import { Entity, ManyToOne, Property } from '@mikro-orm/core';

import { SqlEntity } from './sql-entity';
import { type SqlLevel } from './sql-level';

@Entity({ tableName: 'solution' })
export class SqlSolution extends SqlEntity {
  @ManyToOne()
  level!: SqlLevel;

  @Property({ type: 'json' })
  // mikro-orm fails to parse enum
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  path!: any;

  @Property()
  complexity!: number;
}
