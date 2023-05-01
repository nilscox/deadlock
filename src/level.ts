import { CellType, LevelDescription, Point } from './types';

export class Level {
  public completed = false;
  private cells = new Map<string, Cell>();

  constructor(description: LevelDescription) {
    description.cells.forEach(({ x, y, type }) => {
      this.cells.set(this.key(x, y), new Cell(x, y, type));
    });
  }

  private key(x: number, y: number) {
    return [x, y].join(',');
  }

  at(x: number, y: number) {
    return this.cells.get(this.key(x, y));
  }

  forEachCell(cb: (cell: Cell) => void) {
    Array.from(this.cells.values()).forEach(cb);
  }

  get emptyCells() {
    return Array.from(this.cells.values()).filter((cell) => cell.type === CellType.empty);
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
