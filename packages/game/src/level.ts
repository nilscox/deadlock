import { ReflectionTransform, RotationTransform } from './level-transforms';
import { Player } from './player';
import { assert } from './utils/assert';
import { Direction, getDirectionVector } from './utils/direction';
import { Emitter } from './utils/emitter';
import { IPoint, Point } from './utils/point';

export type LevelDefinition = {
  width: number;
  height: number;
  start: IPoint;
  blocks: IPoint[];
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

  atUnsafe(x: number, y: number): CellType | undefined {
    return this._cells[y]?.[x];
  }

  at(x: number, y: number): CellType {
    const type = this.atUnsafe(x, y);
    assert(type);
    return type;
  }

  cells(type?: CellType) {
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

  isCompleted() {
    return this.cells(CellType.empty).length === 0;
  }

  get hash() {
    return computeHash(this._definition);
  }

  get fingerprint() {
    const hashes = [
      this.hash,
      computeHash(ReflectionTransform.horizontal(this._definition)),
      computeHash(ReflectionTransform.vertical(this._definition)),
      computeHash(RotationTransform.quarter(this._definition)),
      computeHash(RotationTransform.half(this._definition)),
      computeHash(RotationTransform.threeQuarters(this._definition)),
    ];

    return hashes.sort()[0];
  }
}

const computeHash = (definition: LevelDefinition) => {
  const { width, height, start, blocks } = definition;

  return [
    [width, height].join(','),
    [start.x, start.y].join(','),
    ...blocks.map((cell) => [cell.x, cell.y].join(',')),
  ].join('|');
};
