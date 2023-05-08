import { ReflectionTransform, RotationTransform } from './level-transforms';
import { Player } from './player';
import { assert } from './utils/assert';
import { Direction, directions, getDirectionVector } from './utils/direction';
import { Emitter } from './utils/emitter';
import { inspectCustomSymbol } from './utils/inspect';
import { IPoint, Point, PointArgs, pointArgs } from './utils/point';
import { toObject } from './utils/to-object';
import { first, identity, isDefined, last } from './utils/utils';

export type LevelDefinition = {
  width: number;
  height: number;
  start: IPoint;
  blocks: IPoint[];
};

export type Cell = {
  x: number;
  y: number;
  type: CellType;
};

export enum CellType {
  empty = 'empty',
  block = 'block',
  player = 'player',
  path = 'path',
}

export enum LevelEvent {
  loaded = 'loaded',
  restarted = 'restarted',
  completed = 'completed',
  cellChanged = 'cellChanged',
}

type LevelEventsMap = {
  [LevelEvent.cellChanged]: { x: number; y: number; type: CellType };
};

export class Level extends Emitter<LevelEvent, LevelEventsMap> {
  private _cells: CellType[][] = [];
  private _start: Point;

  constructor(private _definition: LevelDefinition) {
    super();

    this._start = new Point(this._definition.start);
    this.load(this._definition);
  }

  get definition(): LevelDefinition {
    return this._definition;
  }

  get start() {
    return this._start.clone();
  }

  load(definition: LevelDefinition): void {
    this._definition = definition;
    this.reset();
    this.emit(LevelEvent.loaded);
  }

  restart(): void {
    this.reset();
    this.emit(LevelEvent.restarted);
  }

  private reset() {
    const definition = this._definition;
    const blocks = definition.blocks.map(({ x, y }) => new Point(x, y));

    this._start = new Point(definition.start);
    this._cells = [];

    for (let y = 0; y < definition.height; ++y) {
      this._cells.push([]);

      for (let x = 0; x < definition.width; ++x) {
        let type = CellType.empty;

        if (blocks.find((block) => block.equals({ x, y }))) {
          type = CellType.block;
        } else if (this._start.equals({ x, y })) {
          type = CellType.player;
        }

        this._cells[y].push(type);
      }
    }
  }

  atUnsafe(x: number, y: number): CellType | undefined;
  atUnsafe(point: Point): CellType | undefined;

  atUnsafe(...args: PointArgs): CellType | undefined {
    const [x, y] = pointArgs(args);
    return this._cells[y]?.[x];
  }

  at(x: number, y: number): CellType;
  at(point: Point): CellType;

  at(...args: PointArgs): CellType {
    const type = this.atUnsafe(...pointArgs(args));
    assert(type);
    return type;
  }

  isEdge(x: number, y: number) {
    return x === 0 || y === 0 || x === this.definition.width - 1 || y === this.definition.height - 1;
  }

  neighbors(x: number, y: number) {
    return directions
      .map((dir) => {
        const p = new Point(x, y).move(dir);
        const type = this.atUnsafe(p);

        if (type) {
          return { x: p.x, y: p.y, type };
        }
      })
      .filter(isDefined);
  }

  cells(type?: CellType): Cell[] {
    const cells = new Array<{ x: number; y: number; type: CellType }>();

    for (let y = 0; y < this._definition.height; ++y) {
      for (let x = 0; x < this._definition.width; ++x) {
        cells.push({ x, y, type: this.at(x, y) });
      }
    }

    if (!type) {
      return cells;
    }

    return cells.filter((cell) => cell.type === type);
  }

  private set(x: number, y: number, type: CellType) {
    this._cells[y][x] = type;
    this.emit(LevelEvent.cellChanged, { x, y, type });
  }

  movePlayer(player: Player, direction: Direction): boolean {
    const [dx, dy] = getDirectionVector(direction);
    const p = player.position;

    let cell: CellType | undefined;

    do {
      cell = this.atUnsafe((p.x += dx), (p.y += dy));

      if (cell === CellType.block) {
        return false;
      }
    } while (cell && cell !== CellType.empty);

    if (!cell) {
      return false;
    }

    this.set(player.position.x, player.position.y, CellType.path);
    this.set(p.x, p.y, CellType.player);

    player.move(p);

    if (this.isCompleted()) {
      this.emit(LevelEvent.completed);
    }

    return true;
  }

  movePlayerBack(player: Player): boolean {
    const prevPosition = player.position;

    if (!player.moveBack()) {
      return false;
    }

    const currentPosition = player.position;

    this.set(prevPosition.x, prevPosition.y, CellType.empty);
    this.set(currentPosition.x, currentPosition.y, CellType.player);

    return true;
  }

  isCompleted(): boolean {
    return this.cells(CellType.empty).length === 0;
  }

  get hash(): string {
    return Level.computeHash(this._definition);
  }

  get fingerprint(): string {
    return Level.computeFingerprint(this._definition);
  }

  static fromHash(hash: string): Level {
    return new Level(Level.parseHash(hash));
  }

  static computeHash(definition: LevelDefinition): string {
    const { width, height, start, blocks } = definition;

    return [
      [width, height].join(','),
      ...blocks.map((cell) => [cell.x, cell.y].join(',')),
      [start.x, start.y].join(','),
    ].join(';');
  }

  static computeFingerprint(definition: LevelDefinition): string {
    const rotations = (def: LevelDefinition) => [
      Level.computeHash(def),
      Level.computeHash(RotationTransform.quarter(def)),
      Level.computeHash(RotationTransform.half(def)),
      Level.computeHash(RotationTransform.threeQuarters(def)),
    ];

    const hashes = [
      ...rotations(definition),
      ...rotations(ReflectionTransform.horizontal(definition)),
      ...rotations(ReflectionTransform.vertical(definition)),
    ].sort();

    return first(hashes) as string;
  }

  static parseHash(hash: string): LevelDefinition {
    const [size, ...cells] = hash.split(';');
    const blocks = cells.slice(0, -1);
    const start = last(cells) as string;
    const [width, height] = size.split(',').map(Number);

    const parsePoint = (str: string): IPoint => {
      const [x, y] = str.split(',').map(Number);
      return { x, y };
    };

    return {
      width,
      height,
      start: parsePoint(start),
      blocks: blocks.map(parsePoint),
    };
  }

  [inspectCustomSymbol]() {
    const charMap: Record<CellType, string> = {
      [CellType.empty]: ' ',
      [CellType.block]: '█',
      [CellType.player]: 'x',
      [CellType.path]: '░',
    };

    const lines: string[][] = [];

    this.cells().forEach(({ x, y, type }) => {
      lines[y] ??= [];
      lines[y][x] = charMap[type];
    });

    lines.forEach((line) => {
      line.unshift('|');
      line.push('|');
    });

    lines.unshift(['+', ...Array(this.definition.width).fill('-'), '+']);
    lines.push(lines[0]);

    return lines.map((line) => line.join('')).join('\n');
  }
}
