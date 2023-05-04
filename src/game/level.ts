import { Cell, CellDescription, CellType } from './cell';
import { directions, getDirectionVector } from './direction';
import { IPoint, Point } from './point';
import { loadLevel, serializeLevel } from './serialize-level';
import { assert } from './utils';

export type LevelDescription = Array<CellDescription>;

export class Level {
  public start = new Point();
  private cells = new Map<string, Cell>();

  constructor(description?: LevelDescription) {
    if (description) {
      this.load(description);
    }
  }

  clear() {
    this.cells.clear();
    this.start.set(0, 0);
  }

  load(description: LevelDescription) {
    this.clear();
    loadLevel(this, description);
  }

  serialize(): LevelDescription {
    return serializeLevel(this);
  }

  reset() {
    this.cellsArray.forEach((cell) => cell.reset());
  }

  get bounds(): { min: IPoint; max: IPoint } {
    const xs = this.cellsArray.map((cell) => cell.x);
    const ys = this.cellsArray.map((cell) => cell.y);

    return {
      min: { x: Math.min(...xs), y: Math.max(...ys) },
      max: { x: Math.max(...xs), y: Math.max(...ys) },
    };
  }

  get cellsArray() {
    return Array.from(this.cells.values());
  }

  private key(x: number, y: number) {
    return [x, y].join(',');
  }

  atUnsafe(x: number, y: number) {
    return this.cells.get(this.key(x, y));
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
    this.cells.set(this.key(x, y), new Cell({ x, y }, type));
  }

  removeCell(cell: Cell) {
    this.cells.delete(this.key(cell.x, cell.y));
  }

  forEachCell(cb: (cell: Cell) => void) {
    this.cellsArray.forEach(cb);
  }

  setStart(cell: Cell) {
    assert(cell.type === CellType.empty, 'cell is not empty');
    this.start = cell.position;
  }

  get emptyCells() {
    return this.cellsArray.filter((cell) => cell.type === CellType.empty);
  }

  get edgeCells() {
    return this.cellsArray.filter((cell) => this.isEdgeCell(cell));
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
}
