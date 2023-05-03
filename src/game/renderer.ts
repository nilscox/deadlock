import paper, { Color, CompoundPath, Group, Layer, Shape } from 'paper';

import { Cell, CellType } from './cell';
import { Game, GameEventType } from './game';
import { Level } from './level';
import { Point } from './point';
import { assert } from './utils';

export class GameRenderer {
  private cells = new Map<Cell, PaperCell>();
  private boundaries!: PaperLevelBoundaries;
  private playerCell!: PaperCell;

  private group: paper.Group;
  private levelLayer: paper.Layer;
  private boundariesLayer: paper.Layer;
  private playerLayer: paper.Layer;

  constructor(canvas: HTMLCanvasElement, private game: Game) {
    paper.setup(canvas);

    this.group = new Group();
    this.levelLayer = new Layer();
    this.boundariesLayer = new Layer();
    this.playerLayer = new Layer();

    this.group.addChild(this.levelLayer);
    this.group.addChild(this.boundariesLayer);
    this.group.addChild(this.playerLayer);
    this.group.applyMatrix = false;

    this.game.addListener(GameEventType.levelStarted, () => {
      this.clear();
      this.initialize();
    });

    this.game.addListener(GameEventType.playerMoved, () => this.update());
    this.game.addListener(GameEventType.levelCompleted, () => this.highlightPlayerPath());
  }

  private get level() {
    return this.game.level;
  }

  private get player() {
    return this.game.player;
  }

  clear() {
    this.levelLayer.removeChildren();
    this.cells.clear();

    this.boundariesLayer.removeChildren();

    this.playerLayer.removeChildren();
  }

  cleanup() {
    paper.project.clear();
  }

  initialize() {
    this.levelLayer.activate();

    this.level.forEachCell((cell) => {
      this.cells.set(cell, new PaperCell(cell.type));
    });

    this.boundariesLayer.activate();
    this.boundaries = new PaperLevelBoundaries(this.level);

    this.playerLayer.activate();
    this.playerCell = new PaperCell(CellType.player);

    this.update();
  }

  update() {
    this.level.forEachCell((cell) => {
      const c = this.cells.get(cell);

      assert(c);

      c.type = cell.type;
      c.position = cell.position;
    });

    this.playerCell.position = this.player.position;

    this.group.bounds.center = paper.view.center;
  }

  highlightPlayerPath() {
    const path = this.player.path;

    for (const { x, y } of path.reverse()) {
      const cell = this.level.at(x, y);
      assert(cell);

      const paperCell = this.cells.get(cell);
      assert(paperCell);

      paperCell.rect.fillColor = new Color(0, 255, 0, 0.2);
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

  set position({ x, y }: Point) {
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
      const { x, y } = cell.position;

      if (!level.has(x, y - 1)) {
        this.addSegment(x, y, 'horizontal');
      }

      if (!level.has(x, y + 1)) {
        this.addSegment(x, y + 1, 'horizontal');
      }

      if (!level.has(x - 1, y)) {
        this.addSegment(x, y, 'vertical');
      }

      if (!level.has(x + 1, y)) {
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
