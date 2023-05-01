import { Direction, getDirectionVector } from './direction';
import { Cell, Level } from './level';
import { CellType, LevelDescription, Point } from './types';

export class Player {
  private cell: Cell;
  private path = new Array<Point>();

  constructor(private level: Level) {
    this.cell = new Cell(0, 0, CellType.player);
  }

  load({ startPosition }: LevelDescription) {
    this.cell.position = startPosition;
  }

  move(direction: Direction) {
    const nextCell = this.findNextCell(direction);

    if (nextCell) {
      this.path.push([this.x, this.y]);
      this.level.at(this.x, this.y)!.type = CellType.path;
      this.position = [nextCell.x, nextCell.y];
    }
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
