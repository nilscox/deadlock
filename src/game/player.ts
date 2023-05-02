import { Direction, getDirectionVector } from './direction';
import { Cell, Level } from './level';
import { CellType, Point } from './types';

export class Player {
  private cell: Cell;
  public path = new Array<Point>();

  constructor(private level: Level) {
    this.cell = new Cell(0, 0, CellType.player);
    this.position = level.start;
  }

  reset() {
    this.path = [];
    this.position = this.level.start;
  }

  move(direction: Direction) {
    const nextCell = this.findNextCell(direction);

    if (!nextCell) {
      return false;
    }

    this.path.push([this.x, this.y]);
    this.level.at(this.x, this.y)!.type = CellType.path;
    this.position = [nextCell.x, nextCell.y];

    return true;
  }

  back() {
    const lastPos = this.path.pop();

    if (!lastPos) {
      return false;
    }

    this.level.at(this.x, this.y)!.type = CellType.empty;
    this.position = lastPos;

    return true;
  }

  private findNextCell(direction: Direction) {
    const [dx, dy] = getDirectionVector(direction);

    let [x, y] = [this.x, this.y];
    let cell: Cell | undefined;

    do {
      cell = this.level.at((x += dx), (y += dy));

      if (cell?.type === CellType.block) {
        return;
      }
    } while (cell && cell.type !== CellType.empty);

    return cell;
  }

  get x() {
    return this.cell.position[0];
  }

  get y() {
    return this.cell.position[1];
  }

  get position(): Point {
    return [this.x, this.y];
  }

  set position(position: Point) {
    this.cell.position = position;
  }
}
