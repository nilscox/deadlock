import { LevelDefinition, type IPoint } from '@deadlock/game';
import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity({ tableName: 'level' })
// @Filter({ name: 'not-deleted', default: true, cond: { deletedAt: null } })
export class SqlLevel implements LevelDefinition {
  @PrimaryKey()
  id!: string;

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
  position!: number;

  @Property({ type: 'real' })
  difficulty!: number;

  @Property({ type: 'real' })
  numberOfSolutionsScore!: number;

  @Property({ type: 'real' })
  easiestSolutionScore!: number;

  // @Property()
  // deletedAt?: Date;
}
