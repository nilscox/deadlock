import paper, { Color, CompoundPath, Layer, Shape, Group } from 'paper';

import { Listener } from './emitter';
import { Game, GameEvent, GameEventType } from './game';
import { Cell, Level } from './level';
import { CellType, Point } from './types';

export class PaperRenderer {
  private cells = new Map<Cell, PaperCell>();
  private boundaries!: PaperLevelBoundaries;
  private playerCell!: PaperCell;

  private group = new Group();
  private levelLayer = new Layer();
  private boundariesLayer = new Layer();
  private playerLayer = new Layer();

  constructor(private game: Game) {
    this.group.addChild(this.levelLayer);
    this.group.addChild(this.boundariesLayer);
    this.group.addChild(this.playerLayer);
    this.group.applyMatrix = false;

    this.initialize();
    this.game.addListener(this.handleGameEvent);
  }

  private handleGameEvent: Listener<GameEvent> = (event) => {
    if (event.type === GameEventType.levelStarted) {
      this.clear();
      this.initialize();
    }

    if (event.type === GameEventType.playerMoved) {
      this.update();
    }
  };

  clear() {
    this.levelLayer.removeChildren();
    this.cells.clear();

    this.boundariesLayer.removeChildren();

    this.playerLayer.removeChildren();
  }

  initialize() {
    this.levelLayer.activate();

    this.game.level.forEachCell((cell) => {
      this.cells.set(cell, new PaperCell(cell.type));
    });

    this.boundariesLayer.activate();
    this.boundaries = new PaperLevelBoundaries(this.game.level);

    this.playerLayer.activate();
    this.playerCell = new PaperCell(CellType.player);

    this.update();
  }

  update() {
    this.game.level.forEachCell((cell) => {
      const c = this.cells.get(cell)!;

      c.type = cell.type;
      c.position = cell.position;
    });

    this.playerCell.position = this.game.player.position;

    this.group.bounds.center = paper.view.center;
  }

  async animatePlayerPath() {
    this.playerLayer.activate();

    for (const [x, y] of this.game.player.path.reverse()) {
      const cell = this.game.level.at(x, y);
      const paperCell = this.cells.get(cell!)!;

      paperCell.rect.fillColor = new Color('#CFC');

      await new Promise((r) => setTimeout(r, 100));
    }
  }
}

class PaperCell {
  static colorsMap: Record<CellType, paper.Color> = {
    [CellType.empty]: new Color('#FFF'),
    [CellType.path]: new Color('#EEE'),
    [CellType.block]: new Color('#CCC'),
    [CellType.player]: new Color('#99F'),
  };

  private cellSize = 40;

  rect = new Shape.Rectangle({
    x: 0,
    y: 0,
    width: this.cellSize,
    height: this.cellSize,
  });

  constructor(type: CellType) {
    this.type = type;
  }

  set type(type: CellType) {
    this.rect.fillColor = PaperCell.colorsMap[type];
  }

  set position([x, y]: Point) {
    this.rect.bounds.left = x * this.cellSize;
    this.rect.bounds.top = y * this.cellSize;
  }
}

class PaperLevelBoundaries {
  private cellSize = 40;

  path = new CompoundPath([]);

  constructor(level: Level) {
    this.path.strokeColor = new Color('#CCC');
    this.path.strokeWidth = 2;

    level.forEachCell((cell) => {
      const [x, y] = cell.position;

      if (!level.at(x, y - 1)) {
        this.addSegment(x, y, 'horizontal');
      }

      if (!level.at(x, y + 1)) {
        this.addSegment(x, y + 1, 'horizontal');
      }

      if (!level.at(x - 1, y)) {
        this.addSegment(x, y, 'vertical');
      }

      if (!level.at(x + 1, y)) {
        this.addSegment(x + 1, y, 'vertical');
      }
    });
  }

  addSegment(x: number, y: number, direction: 'horizontal' | 'vertical') {
    this.path.moveTo([x * this.cellSize, y * this.cellSize]);

    if (direction === 'horizontal') {
      this.path.lineBy([this.cellSize, 0]);
    } else {
      this.path.lineBy([0, this.cellSize]);
    }
  }
}
