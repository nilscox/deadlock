import { Color, Layer, Shape } from 'paper';

export type Point = [number, number];

export type LevelDescription = {
  startPosition: Point;
  width: number;
  height: number;
  cells: CellType[][];
};

export class Level {
  private cellsLayer = new Layer();
  private cells = new Map<string, Cell>();
  private bounds = new Shape.Rectangle([0, 0], [0, 0]);

  private key(x: number, y: number) {
    return [x, y].join(',');
  }

  private init(width: number, height: number) {
    this.cellsLayer.activate();

    for (let i = 0; i < width; ++i) {
      for (let j = 0; j < height; ++j) {
        this.cells.set(this.key(i, j), new Cell(i, j));
      }
    }
  }

  private clear() {
    this.cells.forEach((cell) => cell.remove());
    this.cells.clear();

    this.bounds.remove();
  }

  get emptyCells() {
    return Array.from(this.cells.values()).filter((cell) => cell.type === CellType.empty);
  }

  setCompleted() {
    this.bounds.strokeColor = new Color('green');
  }

  at(x: number, y: number) {
    return this.cells.get(this.key(x, y));
  }

  load(description: LevelDescription) {
    this.clear();

    this.cellsLayer.activate();
    this.init(description.width, description.height);

    for (const [j, line] of Object.entries(description.cells)) {
      for (const [x, cell] of Object.entries(line)) {
        this.at(Number(x), Number(j))?.setType(cell);
      }
    }

    this.bounds = new Shape.Rectangle(
      this.cellsLayer.firstChild.bounds.topLeft,
      this.cellsLayer.lastChild.bounds.bottomRight
    );

    this.bounds.strokeColor = new Color('#CCC');
  }
}

export enum CellType {
  empty = 'empty',
  path = 'path',
  block = 'block',
  player = 'player',
}

export class Cell {
  static cellColors: Record<CellType, paper.Color> = {
    [CellType.empty]: new Color('#FFF'),
    [CellType.path]: new Color('#EEE'),
    [CellType.block]: new Color('#CCC'),
    [CellType.player]: new Color('#99F'),
  };

  private _type = CellType.empty;

  private rect: paper.Shape.Rectangle;

  constructor(x: number, y: number) {
    this.rect = new Shape.Rectangle([x * 40, y * 40], [40, 40]);
    this.setType(this._type);
  }

  remove() {
    this.rect.remove();
  }

  setPosition(x: number, y: number) {
    this.rect.bounds.left = x * 40;
    this.rect.bounds.top = y * 40;
  }

  setType(type: CellType) {
    this._type = type;
    this.rect.fillColor = Cell.cellColors[type];
  }

  get type() {
    return this._type;
  }

  get bounds() {
    return this.rect.bounds;
  }

  get x() {
    return this.bounds.left / 40;
  }

  get y() {
    return this.bounds.top / 40;
  }

  get position() {
    return [this.x, this.y];
  }
}
