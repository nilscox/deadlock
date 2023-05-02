import { Direction, getDirectionVector } from './direction';
import { CellType, LevelDescription, Point } from './types';
import { assert } from './utils';

export class Level {
  public start: Point;
  private cells = new Map<string, Cell>();

  private readonly bounds = {
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
  };

  constructor(description: LevelDescription) {
    let start: Point | undefined;

    description.forEach(({ x, y, type }) => {
      if (x < this.bounds.minX) this.bounds.minX = x;
      if (y < this.bounds.minY) this.bounds.minY = y;
      if (x > this.bounds.maxX) this.bounds.maxX = x;
      if (y > this.bounds.maxY) this.bounds.maxY = y;

      if (type === CellType.player) {
        start = [x, y];
        type = CellType.empty;
      }

      this.cells.set(this.key(x, y), new Cell(x, y, type));
    });

    assert(start, 'missing start position');
    this.start = start;
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

  at(x: number, y: number) {
    return this.cells.get(this.key(x, y));
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

  getNeighbors(cell: Cell) {
    return Object.values(Direction)
      .map((dir) => {
        const [dx, dy] = getDirectionVector(dir);
        return this.at(cell.x + dx, cell.y + dy);
      })
      .filter(Boolean) as Cell[];
  }

  serialize(): LevelDescription {
    return this.cellsArray.map((cell) => ({
      x: cell.x,
      y: cell.y,
      type: cell.x === this.start[0] && cell.y === this.start[1] ? CellType.player : cell.type,
    }));
  }
}

export class Cell {
  public position: Point;
  public type: CellType;

  constructor(x: number, y: number, type: CellType) {
    this.position = [x, y];
    this.type = type;
  }

  get x() {
    return this.position[0];
  }

  get y() {
    return this.position[1];
  }
}
