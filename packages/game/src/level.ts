import { ReflectionTransform, RotationTransform } from './level-transforms';
import { Player } from './player';
import { assert, defined } from './utils/assert';
import { Direction, directions } from './utils/direction';
import { Emitter } from './utils/emitter';
import { inspectCustomSymbol } from './utils/inspect';
import { IPoint, Point, PointArgs, pointArgs } from './utils/point';
import { array, first, isDefined } from './utils/utils';

export enum LevelFlag {
  déjàVu = 'déjà_vu',
  easy = 'easy',
  hard = 'hard',
  cool = 'cool',
}

export type LevelDefinition = {
  width: number;
  height: number;
  start: IPoint;
  blocks: IPoint[];
  teleports: IPoint[];
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
  teleport = 'teleport',
}

export class LevelMap {
  private _cells = new Array<Array<CellType>>();

  get width(): number {
    assert(this._cells[0]);
    return this._cells[0].length;
  }

  set width(width: number) {
    this.definition = { ...this.definition, width };
  }

  get height(): number {
    return this._cells.length;
  }

  set height(height: number) {
    this.definition = { ...this.definition, height };
  }

  get definition(): LevelDefinition {
    const cellToPoint = ({ x, y }: Cell) => ({ x, y });

    return {
      width: this.width,
      height: this.height,
      start: cellToPoint(this.cells(CellType.player)[0]),
      blocks: this.cells(CellType.block).map(cellToPoint),
      teleports: this.cells(CellType.teleport).map(cellToPoint),
    };
  }

  set definition(definition: LevelDefinition) {
    this._cells = array(definition.height, () => array(definition.width, () => CellType.empty));

    const set = (type: CellType) => {
      return ({ x, y }: IPoint) => {
        assert(this.at(x, y) === CellType.empty);
        this.set(x, y, type);
      };
    };

    set(CellType.player)(definition.start);

    definition.blocks.forEach(set(CellType.block));
    definition.teleports.forEach(set(CellType.teleport));
  }

  clone() {
    const map = new LevelMap();
    map._cells = structuredClone(this._cells);
    return map;
  }

  atUnsafe(x: number, y: number): CellType | undefined {
    return this._cells[y]?.[x];
  }

  at(x: number, y: number): CellType;
  at(point: IPoint): CellType;

  at(...args: PointArgs): CellType {
    const [x, y] = pointArgs(args);
    const type = this.atUnsafe(x, y);
    assert(type);
    return type;
  }

  neighbors(x: number, y: number) {
    return directions
      .map((dir) => {
        const p = new Point(x, y).move(dir);
        const type = this.atUnsafe(p.x, p.y);

        if (type) {
          return { x: p.x, y: p.y, type };
        }
      })
      .filter(isDefined);
  }

  cells(type?: CellType): Cell[] {
    const cells = new Array<{ x: number; y: number; type: CellType }>();

    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        cells.push({ x, y, type: this.at(x, y) });
      }
    }

    if (!type) {
      return cells;
    }

    return cells.filter((cell) => cell.type === type);
  }

  set(x: number, y: number, type: CellType) {
    assert(x < this.width);
    assert(y < this.height);
    this._cells[y][x] = type;
  }

  [inspectCustomSymbol]() {
    const charMap: Record<CellType, string> = {
      [CellType.empty]: ' ',
      [CellType.block]: '█',
      [CellType.player]: 'x',
      [CellType.path]: '░',
      [CellType.teleport]: 'T',
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

    lines.unshift(['+', ...Array<string>(this.width).fill('-'), '+']);
    lines.push(lines[0]);

    return lines.map((line) => line.join('')).join('\n');
  }
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
  public map = new LevelMap();

  private states = new Array<LevelMap>();

  private constructor(public definition: LevelDefinition) {
    super();
    this.load(definition);
  }

  get start() {
    return this.definition.start;
  }

  get hash(): string {
    return LevelHash.getHash(this.map.definition);
  }

  get fingerprint(): string {
    return LevelHash.getFingerprint(this.map.definition);
  }

  load(definition: LevelDefinition) {
    this.definition = definition;
    this.map.definition = this.definition;
    this.states = [];

    this.emit(LevelEvent.loaded);
  }

  static load(definition: LevelDefinition | string) {
    if (typeof definition === 'string') {
      return new Level(LevelHash.parse(definition));
    } else {
      return new Level(definition);
    }
  }

  set(x: number, y: number, type: CellType) {
    this.map.set(x, y, type);
    this.emit(LevelEvent.cellChanged, { x, y, type });
  }

  restart() {
    this.map.definition = this.definition;
    this.states = [];

    this.emit(LevelEvent.restarted);
  }

  movePlayer(player: Player, direction: Direction) {
    const p = player.position;
    let cell: CellType | undefined;

    do {
      p.set(p.move(direction));
      cell = this.map.atUnsafe(p.x, p.y);
    } while (cell === CellType.path);

    if (!cell || cell === CellType.block) {
      return false;
    }

    this.states.push(this.map.clone());

    this.set(player.position.x, player.position.y, CellType.path);
    this.set(p.x, p.y, CellType.player);

    player.move(p.x, p.y);

    if (cell === CellType.teleport) {
      const [dest] = this.map.cells(CellType.teleport).filter((cell) => !p.equals(cell));

      assert(dest);

      this.set(p.x, p.y, CellType.path);
      this.set(dest.x, dest.y, CellType.player);

      player.teleport(dest.x, dest.y);
    }

    if (this.isCompleted()) {
      this.emit(LevelEvent.completed);
    }

    return true;
  }

  movePlayerBack(player: Player): boolean {
    const prevState = this.states.pop();

    if (!prevState) {
      return false;
    }

    this.map = prevState.clone();
    player.moveBack();

    if (this.map.at(player.position.x, player.position.y) === CellType.teleport) {
      player.moveBack();
    }

    return true;
  }

  isCompleted(): boolean {
    return this.map.cells(CellType.empty).length === 0 && this.map.cells(CellType.teleport).length === 0;
  }

  [inspectCustomSymbol]() {
    return this.map[inspectCustomSymbol]();
  }
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class LevelHash {
  static getHash(definition: LevelDefinition): string {
    const { width, height, start, blocks, teleports } = definition;

    const pointList = (points: IPoint[]) => {
      return points
        .sort(({ x: a }, { x: b }) => a - b)
        .sort(({ y: a }, { y: b }) => a - b)
        .map(({ x, y }) => [x, y].join(','))
        .join(';');
    };

    return [
      [width, height].join(','),
      blocks.length && 'B' + pointList(blocks),
      teleports.length && 'T' + pointList(teleports),
      'S' + [start.x, start.y].join(','),
    ]
      .filter(Boolean)
      .join('');
  }

  static getFingerprint(definition: LevelDefinition): string {
    const rotations = (def: LevelDefinition) => [
      LevelHash.getHash(def),
      LevelHash.getHash(RotationTransform.quarter(def)),
      LevelHash.getHash(RotationTransform.half(def)),
      LevelHash.getHash(RotationTransform.threeQuarters(def)),
    ];

    const hashes = [
      ...rotations(definition),
      ...rotations(ReflectionTransform.horizontal(definition)),
      ...rotations(ReflectionTransform.vertical(definition)),
    ].sort();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return first(hashes)!;
  }

  static parse(hash: string): LevelDefinition {
    const match = (re: RegExp) => {
      return hash.match(re);
    };

    const size = defined(match(/^\d+,\d+/)?.[0]);
    const [width, height] = size.split(',').map(Number);
    const blocks = match(/B((\d,\d;?)+)/)?.[1];
    const teleports = match(/T((\d,\d;?)+)/)?.[1];
    const start = defined(match(/S(\d,\d)$/)?.[1]);

    const parsePoint = (str: string): IPoint => {
      const [x, y] = str.split(',').map(Number);
      return { x, y };
    };

    const parsePoints = (str?: string): IPoint[] => {
      return str?.split(';').map(parsePoint) ?? [];
    };

    return {
      width,
      height,
      start: parsePoint(start),
      blocks: parsePoints(blocks),
      teleports: parsePoints(teleports),
    };
  }
}
