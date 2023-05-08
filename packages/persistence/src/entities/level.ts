import { LevelDefinition, type IPoint } from '@deadlock/game';
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'level' })
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

  @Property()
  fingerprint!: string;

  @Property()
  levelNumber?: number;

  @Property()
  difficulty!: number;

  @Property()
  numberOfSolutionsScore!: number;

  @Property()
  easiestSolutionScore!: number;
}
