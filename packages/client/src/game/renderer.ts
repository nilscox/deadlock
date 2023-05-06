import { Point, CellType, Game, Level, LevelEvent, Player, PlayerEvent, assert } from '@deadlock/game';
import { PaperScope, Color, CompoundPath, Group, Layer, Shape } from 'paper';

const cellSize = 40;

export class GameRenderer {
  private scope: paper.PaperScope;
  private view: paper.View;
  private group: paper.Group;

  private levelRenderer: LevelRenderer;
  private playerRenderer: PlayerRenderer;

  constructor(canvas: HTMLCanvasElement, private game: Game) {
    this.scope = new PaperScope();
    this.scope.setup(canvas);

    this.view = this.scope.view;

    this.group = new Group();
    this.group.applyMatrix = false;

    this.levelRenderer = new LevelRenderer(game.level);
    this.playerRenderer = new PlayerRenderer(game.player);

    this.group.addChild(this.playerRenderer.layer);
    this.group.addChild(this.levelRenderer.layer);

    this.playerRenderer.layer.bringToFront();

    this.game.level.addListener(LevelEvent.loaded, () => {
      this.update();
    });

    this.view.onFrame = () => {
      this.onFrame();
    };

    this.update();
  }

  scale(scale: number) {
    this.view.scale(scale);
  }

  update() {
    this.levelRenderer.clear();
    this.levelRenderer.init();
    this.group.bounds.center = this.view.center;
  }

  onFrame() {
    this.levelRenderer.onFrame();
    this.playerRenderer.onFrame();
  }
}

const colors: Record<CellType, paper.Color> = {
  [CellType.empty]: new Color('#FFF'),
  [CellType.path]: new Color('#EEE'),
  [CellType.block]: new Color('#CCC'),
  [CellType.player]: new Color('#FFF'),
};

export class LevelRenderer {
  public layer = new Layer();
  public boundaries: LevelBoundaries;

  private cells = new Map<string, paper.Shape>();

  constructor(private level: Level) {
    this.layer.name = 'level';
    this.boundaries = new LevelBoundaries(level);

    level.addListener(LevelEvent.completed, () => {
      this.onLevelCompleted();
    });

    level.addListener(LevelEvent.restarted, () => {
      for (const { x, y, type } of level.cells()) {
        const rect = this.cells.get(`${x},${y}`);

        assert(rect);
        rect.fillColor = colors[type];
      }

      this.boundaries.clear();
      this.boundaries.init();
    });

    this.level.addListener(LevelEvent.cellChanged, ({ x, y, type }) => {
      const rect = this.cells.get(`${x},${y}`);

      assert(rect);
      rect.fillColor = colors[type];
    });
  }

  clear() {
    this.layer.removeChildren();
    this.cells.clear();

    this.boundaries.clear();
  }

  init() {
    this.layer.activate();

    this.level.cells().forEach(({ x, y, type }) => {
      const rect = new Shape.Rectangle({
        x: x * cellSize,
        y: y * cellSize,
        width: cellSize,
        height: cellSize,
      });

      rect.fillColor = colors[type];

      this.cells.set(`${x},${y}`, rect);
    });

    this.boundaries.init();
    this.layer.addChild(this.boundaries.layer);
  }

  onLevelCompleted() {
    const path = this.level.cells(CellType.path);

    for (const { x, y } of path) {
      const rect = this.cells.get(`${x},${y}`);

      assert(rect);
      rect.fillColor = new Color('#CFC');
    }

    this.boundaries.onLevelCompleted();
  }

  onFrame() {
    //
  }
}

export class PlayerRenderer {
  public layer = new Layer();

  private cell: paper.Shape;
  private target?: Point;

  constructor(player: Player) {
    this.layer.activate();
    this.layer.name = 'player';

    this.cell = new Shape.Rectangle({
      x: 0,
      y: 0,
      width: cellSize,
      height: cellSize,
    });

    this.cell.bounds.top = player.position.y * cellSize;
    this.cell.bounds.left = player.position.x * cellSize;
    this.cell.fillColor = new Color('#99F');

    player.addListener(PlayerEvent.moved, ({ x, y }) => {
      this.target = new Point({
        x: x * cellSize,
        y: y * cellSize,
      });
    });

    player.addListener(PlayerEvent.reset, () => {
      this.target = new Point({
        x: player.position.x * cellSize,
        y: player.position.y * cellSize,
      });
    });
  }

  onFrame() {
    if (!this.target) {
      return;
    }

    const { x, y } = this.target;
    const [dx, dy] = [x - this.cell.bounds.left, y - this.cell.bounds.top];

    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
      this.cell.bounds.left = x;
      this.cell.bounds.top = y;
      delete this.target;
    } else {
      this.cell.bounds.left += dx * 0.5;
      this.cell.bounds.top += dy * 0.5;
    }
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
    this.path.strokeCap = 'round';

    this.level.cells().forEach(({ x, y }) => {
      if (this.level.atUnsafe(x, y - 1) === undefined) {
        this.addSegment(x, y, 'horizontal');
      }

      if (this.level.atUnsafe(x, y + 1) === undefined) {
        this.addSegment(x, y + 1, 'horizontal');
      }

      if (this.level.atUnsafe(x - 1, y) === undefined) {
        this.addSegment(x, y, 'vertical');
      }

      if (this.level.atUnsafe(x + 1, y) === undefined) {
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

  onLevelCompleted() {
    assert(this.path);
    this.path.strokeColor = new Color('#9C9');
  }
}
