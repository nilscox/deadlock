import paper, { Color, CompoundPath, Group, Layer, Shape } from 'paper';

import { Cell, CellEvent, CellType } from './cell';
import { Game, GameEventType } from './game';
import { Level } from './level';
import { Player } from './player';
import { PointEvent } from './point';
import { assert } from './utils';

const cellSize = 40;

export class GameRenderer {
  private group = new Group();

  private levelRenderer: LevelRenderer;
  private playerRenderer: PlayerRenderer;

  constructor(private game: Game) {
    this.group.applyMatrix = false;

    this.levelRenderer = new LevelRenderer(game.level);
    this.playerRenderer = new PlayerRenderer(game.player);

    this.group.addChild(this.playerRenderer.layer);
    this.group.addChild(this.levelRenderer.layer);

    this.playerRenderer.layer.bringToFront();

    this.game.addListener(GameEventType.levelChanged, () => {
      this.levelRenderer.clear();
      this.levelRenderer.init();
      this.group.bounds.center = paper.view.center;
    });

    this.game.addListener(GameEventType.levelCompleted, () => this.levelRenderer.levelCompleted());
  }

  cleanup() {
    paper.project.clear();
  }
}

const colors: Record<CellType, paper.Color> = {
  [CellType.empty]: new Color('#FFF'),
  [CellType.path]: new Color('#EEE'),
  [CellType.block]: new Color('#CCC'),
  [CellType.player]: new Color('#99F'),
};

export class LevelRenderer {
  public layer = new Layer();
  public boundaries: LevelBoundaries;

  private cells = new Map<Cell, paper.Shape>();

  constructor(private level: Level) {
    this.layer.name = 'level';
    this.boundaries = new LevelBoundaries(level);
  }

  clear() {
    this.layer.removeChildren();
    this.cells.clear();

    this.boundaries.clear();
  }

  init() {
    this.layer.activate();

    this.level.forEachCell((cell) => {
      const rect = new Shape.Rectangle({
        x: cell.x * cellSize,
        y: cell.y * cellSize,
        width: cellSize,
        height: cellSize,
      });

      rect.fillColor = colors[cell.type];

      this.cells.set(cell, rect);

      cell.addListener(CellEvent.typeChanged, ({ type }) => {
        rect.fillColor = colors[type];
      });
    });

    this.boundaries.init();
    this.layer.addChild(this.boundaries.layer);
  }

  levelCompleted() {
    const path = this.level.cellsArray.filter((cell) => cell.type === CellType.path);

    for (const cell of path) {
      const rect = this.cells.get(cell);
      assert(rect);

      rect.fillColor = new Color('#CFC');
    }
  }
}

export class PlayerRenderer {
  public layer = new Layer();

  private cell: paper.Shape;

  constructor(player: Player) {
    this.layer.activate();
    this.layer.name = 'player';

    this.cell = new Shape.Rectangle({
      x: 0,
      y: 0,
      width: cellSize,
      height: cellSize,
    });

    this.cell.bounds.top = player.y * cellSize;
    this.cell.bounds.left = player.x * cellSize;
    this.cell.fillColor = new Color('#99F');

    player.position.addListener(PointEvent.changed, ({ x, y }) => {
      this.cell.bounds.left = x * cellSize;
      this.cell.bounds.top = y * cellSize;
    });
  }
}

class LevelBoundaries {
  public layer = new Layer();
  private path?: paper.CompoundPath;

  constructor(private level: Level) {}

  clear() {
    this.layer.removeChildren();
  }

  init() {
    this.layer.activate();
    this.layer.name = 'level-boundaries';

    this.path = new CompoundPath([]);

    this.path.strokeColor = new Color('#CCC');
    this.path.strokeWidth = 2;

    this.level.forEachCell((cell) => {
      const { x, y } = cell.position;

      if (!this.level.has(x, y - 1)) {
        this.addSegment(x, y, 'horizontal');
      }

      if (!this.level.has(x, y + 1)) {
        this.addSegment(x, y + 1, 'horizontal');
      }

      if (!this.level.has(x - 1, y)) {
        this.addSegment(x, y, 'vertical');
      }

      if (!this.level.has(x + 1, y)) {
        this.addSegment(x + 1, y, 'vertical');
      }
    });
  }

  addSegment(x: number, y: number, direction: 'horizontal' | 'vertical') {
    assert(this.path);

    this.path.moveTo([x * cellSize, y * cellSize]);

    if (direction === 'horizontal') {
      this.path.lineBy([cellSize, 0]);
    } else {
      this.path.lineBy([0, cellSize]);
    }
  }
}
