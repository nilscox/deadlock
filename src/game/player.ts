import { Cell, CellType } from './cell';
import { Direction, getDirectionVector } from './direction';
import { Emitter } from './emitter';
import { Level } from './level';
import { IPoint, Point } from './point';
import { assert } from './utils';

export enum PlayerEvent {
  moved = 'moved',
}

type PlayerEventsMap = {
  [PlayerEvent.moved]: IPoint;
};

export class Player extends Emitter<PlayerEvent, PlayerEventsMap> implements IPoint {
  private cell = new Cell({ x: 0, y: 0 }, CellType.player);
  public path = new Array<IPoint>();

  constructor(private level: Level) {
    super();
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

  reset() {
    this.path = [];

    assert(this.level.playerPosition);
    this.position.set(this.level.playerPosition);
  }

  move(direction: Direction) {
    const nextCell = this.findNextCell(direction);

    if (!nextCell) {
      return false;
    }

    this.path.push(this.position.clone());
    this.position.set(nextCell);

    this.emit(PlayerEvent.moved, this.position);

    return true;
  }

  back() {
    const lastPos = this.path.pop();

    if (!lastPos) {
      return false;
    }

    this.position.set(lastPos);

    this.emit(PlayerEvent.moved, this.position);

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
}
