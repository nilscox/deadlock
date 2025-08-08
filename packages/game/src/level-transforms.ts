import { type LevelDefinition } from './level';
import { type IPoint } from './utils/point';

abstract class LevelTransform {
  abstract point(def: LevelDefinition, point: IPoint): IPoint;

  width?(def: LevelDefinition): number;
  height?(def: LevelDefinition): number;

  transform(def: LevelDefinition): LevelDefinition {
    return {
      width: this.width?.(def) ?? def.width,
      height: this.height?.(def) ?? def.height,
      start: this.point(def, def.start),
      blocks: def.blocks.map((point) => this.point(def, point)),
      teleports: def.teleports.map((point) => this.point(def, point)),
    };
  }
}

export class ReflectionTransform extends LevelTransform {
  private constructor(private direction: 'horizontal' | 'vertical') {
    super();
  }

  point({ width, height }: LevelDefinition, { x, y }: IPoint): IPoint {
    if (this.direction === 'horizontal') {
      x = width - x - 1;
    } else {
      y = height - y - 1;
    }

    return { x, y };
  }

  static horizontal(def: LevelDefinition) {
    return new ReflectionTransform('horizontal').transform(def);
  }

  static vertical(def: LevelDefinition) {
    return new ReflectionTransform('vertical').transform(def);
  }
}

export class RotationTransform extends LevelTransform {
  width(def: LevelDefinition): number {
    return def.height;
  }

  height(def: LevelDefinition): number {
    return def.width;
  }

  /*
   * 0,0 -> 0,2
   * 1,0 -> 0,1
   * 2,0 -> 0,0
   * 0,1 -> 1,2
   * 1,1 -> 1,1
   * 2,1 -> 1,0
   *
   * rx = y
   * ry = h - x - 1
   */

  point(def: LevelDefinition, { x, y }: IPoint): IPoint {
    return {
      x: y,
      y: this.height(def) - x - 1,
    };
  }

  static quarter(def: LevelDefinition) {
    return new RotationTransform().transform(def);
  }

  static half(def: LevelDefinition) {
    return this.quarter(this.quarter(def));
  }

  static threeQuarters(def: LevelDefinition) {
    return this.quarter(this.quarter(this.quarter(def)));
  }
}
