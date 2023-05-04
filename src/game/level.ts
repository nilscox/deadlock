import { Cell, CellDescription, CellType } from './cell';
import { directions, getDirectionVector } from './direction';
import { Emitter } from './emitter';
import { IPoint, Point } from './point';
import { loadLevel, serializeLevel } from './serialize-level';
import { assert } from './utils';

export type LevelDescription = Array<CellDescription>;

export enum LevelEventType {
  loaded = 'loaded',
  restarted = 'restarted',
  completed = 'completed',
}

export class Level extends Emitter<LevelEventType> {
  private _cells = new Map<string, Cell>();

  constructor(description?: LevelDescription) {
    super();

    if (description) {
      this.load(description);
    }
  }

  private key(x: number, y: number) {
    return [x, y].join(',');
  }

  atUnsafe(x: number, y: number) {
    return this._cells.get(this.key(x, y));
  }

  at(x: number, y: number) {
    const cell = this.atUnsafe(x, y);

    assert(cell);

    return cell;
  }

  has(x: number, y: number) {
    return this.atUnsafe(x, y) !== undefined;
  }

  addCell(x: number, y: number, type: CellType) {
    this._cells.set(this.key(x, y), new Cell({ x, y }, type));
  }

  removeCell(cell: Cell) {
    this._cells.delete(this.key(cell.x, cell.y));
  }

  cells(type?: CellType) {
    const cells = Array.from(this._cells.values());

    if (!type) {
      return cells;
    }

    return cells.filter((cell) => cell.type === type);
  }

  forEachCell(cb: (cell: Cell) => void) {
    this.cells().forEach(cb);
  }

  get playerPosition(): Point | undefined {
    return this.cells(CellType.player)[0]?.position;
  }

  setPlayerPosition(x: number, y: number) {
    const cell = this.at(x, y);

    if (this.playerPosition) {
      const { x, y } = this.playerPosition;
      this.at(x, y).type = CellType.path;
    }

    cell.type = CellType.player;

    if (this.isCompleted()) {
      this.emit(LevelEventType.completed);
    }
  }

  isCompleted() {
    return this.cells(CellType.empty).length === 0;
  }

  get bounds(): { min: IPoint; max: IPoint } {
    const xs = this.cells().map((cell) => cell.x);
    const ys = this.cells().map((cell) => cell.y);

    return {
      min: { x: Math.min(...xs), y: Math.min(...ys) },
      max: { x: Math.max(...xs), y: Math.max(...ys) },
    };
  }

  get edgeCells() {
    return this.cells().filter((cell) => this.isEdgeCell(cell));
  }

  isEdgeCell({ x, y }: Cell) {
    return [
      this.atUnsafe(x - 1, 0),
      this.atUnsafe(x + 1, 0),
      this.atUnsafe(x, y - 1),
      this.atUnsafe(x, y + 1),
    ].some((cell) => cell === undefined);
  }

  getNeighbors(x: number, y: number) {
    return directions.map((dir) => {
      const [dx, dy] = getDirectionVector(dir);
      return [dir, this.atUnsafe(x + dx, y + dy)] as const;
    });
  }

  load(description: LevelDescription) {
    this._cells.clear();
    loadLevel(this, description);
    this.emit(LevelEventType.loaded);
  }

  serialize(): LevelDescription {
    return serializeLevel(this);
  }

  reset() {
    this.forEachCell((cell) => cell.reset());
    this.emit(LevelEventType.restarted);
  }
}
