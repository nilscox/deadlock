import { Tool, Layer } from 'paper';

import { Direction, getDirectionVector, isDirection } from './direction';
import { Cell, CellType, Level, LevelDescription } from './level';
import { levels } from './levels';

export class Game {
  private tool = new Tool();
  private level = new Level();
  private player = new Player(this.level);

  private currentLevelIndex = 0;

  private get currentLevel() {
    return levels[this.currentLevelIndex];
  }

  constructor(private canvas: HTMLCanvasElement) {
    this.tool.onKeyDown = this.onKeyDown;

    this.load(this.currentLevel);
  }

  load(level: LevelDescription) {
    this.level.load(level);
    this.player.load(level);

    this.canvas.width = level.width * 40;
    this.canvas.height = level.height * 40;
  }

  onKeyDown = (event: paper.KeyEvent) => {
    if (this.isLevelCompleted()) {
      return;
    }

    if (event.key === 'space') {
      this.restartLevel();
    }

    if (isDirection(event.key)) {
      this.player.move(event.key);

      if (this.isLevelCompleted()) {
        this.level.setCompleted();
        setTimeout(() => this.nextLevel(), 2000);
      }
    }
  };

  isLevelCompleted() {
    return this.level.emptyCells.length === 1;
  }

  restartLevel() {
    this.load(this.currentLevel);
  }

  nextLevel() {
    if (this.currentLevelIndex === levels.length - 1) {
      return;
    }

    this.currentLevelIndex++;
    this.load(this.currentLevel);
  }
}

export class Player {
  private cell: Cell;
  private layer = new Layer();

  constructor(private level: Level) {
    this.layer.activate();
    this.cell = new Cell(0, 0);
    this.cell.setType(CellType.player);
  }

  load(level: LevelDescription) {
    const [x, y] = level.startPosition;
    this.cell.setPosition(x, y);
  }

  move(direction: Direction) {
    const nextCell = this.findNextCell(direction);

    if (nextCell) {
      this.level.at(this.x, this.y)?.setType(CellType.path);
      this.setPosition(nextCell.x, nextCell.y);
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
    return this.cell.x;
  }

  get y() {
    return this.cell.y;
  }

  setPosition(x: number, y: number) {
    return this.cell.setPosition(x, y);
  }
}
