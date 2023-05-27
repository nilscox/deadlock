import { LevelDefinition, LevelFlag, type IPoint } from '@deadlock/game';
import { Entity, Filter, Property, Unique } from '@mikro-orm/core';

import { SqlEntity } from './sql-entity';

@Entity({ tableName: 'level' })
@Filter({ name: 'not-deleted', default: true, cond: { deletedAt: null } })
export class SqlLevel extends SqlEntity implements LevelDefinition {
  @Property()
  width!: number;

  @Property()
  height!: number;

  @Property({ type: 'json' })
  blocks!: Array<IPoint>;

  @Property({ type: 'json' })
  start!: IPoint;

  @Property({ type: 'json' })
  teleports!: Array<IPoint>;

  @Property()
  @Unique()
  fingerprint!: string;

  @Property()
  @Unique()
  position!: number | null;

  @Property({ type: 'real' })
  difficulty!: number;

  @Property({ type: 'real' })
  numberOfSolutionsScore!: number;

  @Property({ type: 'real' })
  easiestSolutionScore!: number;

  @Property({ type: 'json', default: [] })
  flags!: Array<LevelFlag>;

  @Property()
  deletedAt?: Date;
}
