import { Cell, CellType } from './cell';
import { Direction, getDirectionVector } from './direction';
import { Level } from './level';
import { IPoint, Point } from './point';

export class Player implements IPoint {
  private cell: Cell;
  public path = new Array<IPoint>();

  constructor(private level: Level) {
    this.cell = new Cell(0, 0, CellType.player);
    this.reset();
  }

  reset() {
    this.path = [];
    this.position = this.level.start.clone();
  }

  move(direction: Direction) {
    const nextCell = this.findNextCell(direction);

    if (!nextCell) {
      return false;
    }

    this.path.push(this.position.clone());
    this.level.at(this.x, this.y).type = CellType.path;
    this.position.set(nextCell);

    return true;
  }

  back() {
    const lastPos = this.path.pop();

    if (!lastPos) {
      return false;
    }

    this.level.at(this.x, this.y).type = CellType.empty;
    this.position.set(lastPos);

    return true;
  }

  private findNextCell(direction: Direction) {
    const [dx, dy] = getDirectionVector(direction);

    let [x, y] = [this.x, this.y];
    let cell: Cell | undefined;

    do {
      cell = this.level.atUnsafe((x += dx), (y += dy));

      if (cell?.type === CellType.block) {
        return;
      }
    } while (cell && cell.type !== CellType.empty);

    return cell;
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get position(): Point {
    return this.cell.position;
  }

  set position(position: Point) {
    this.cell.position = position;
  }
}
