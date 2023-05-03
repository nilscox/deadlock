import { Cell, CellType } from './cell';
import { directions, getDirectionVector } from './direction';
import { IPoint, Point } from './point';
import { assert } from './utils';

export type LevelDescription = Array<{
  x: number;
  y: number;
  type: CellType;
}>;

export class Level {
  public start = new Point();
  private cells = new Map<string, Cell>();

  private description?: LevelDescription;

  private readonly bounds = {
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
  };

  constructor(description?: LevelDescription) {
    if (description) {
      this.set(description);
    }
  }

  set(description: LevelDescription) {
    let start: IPoint | undefined;

    this.cells.clear();
    this.description = description;

    this.description.forEach(({ x, y, type }) => {
      if (x < this.bounds.minX) this.bounds.minX = x;
      if (y < this.bounds.minY) this.bounds.minY = y;
      if (x > this.bounds.maxX) this.bounds.maxX = x;
      if (y > this.bounds.maxY) this.bounds.maxY = y;

      if (type === CellType.player) {
        start = { x, y };
        type = CellType.empty;
      }

      this.addCell(x, y, type);
    });

    assert(start, 'missing start position');
    this.start = new Point(start);
  }

  reset() {
    assert(this.description);

    this.description.forEach(({ x, y, type }) => {
      this.at(x, y).type = type;
    });
  }

  get width() {
    return this.bounds.maxX - this.bounds.minX;
  }

  get height() {
    return this.bounds.maxY - this.bounds.minY;
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
    this.cells.set(this.key(x, y), new Cell(x, y, type));
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
    const { minX, minY, maxX, maxY } = this.bounds;
    return x === minX || y === minY || x === maxX || y === maxY;
  }

  getNeighbors(x: number, y: number) {
    return directions.map((dir) => {
      const [dx, dy] = getDirectionVector(dir);
      return [dir, this.atUnsafe(x + dx, y + dy)] as const;
    });
  }

  serialize(): LevelDescription {
    return this.cellsArray.map((cell) => ({
      x: cell.x,
      y: cell.y,
      type: this.start.equals(cell) ? CellType.player : cell.type,
    }));
  }
}
