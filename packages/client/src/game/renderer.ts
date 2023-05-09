import { CellType, Game, Level, LevelEvent, Player, PlayerEvent, Point, assert } from '@deadlock/game';
import paper from 'paper';
import { getLevelBoundaries } from './get-level-boundaries';

const cellSize = 40;

export class GameRenderer {
  private scope: paper.PaperScope;
  private view: paper.View;
  private group: paper.Group;

  private levelRenderer: LevelRenderer;
  private playerRenderer: PlayerRenderer;

  constructor(canvas: HTMLCanvasElement, game: Game) {
    this.scope = new paper.PaperScope();
    this.scope.setup(canvas);

    this.view = this.scope.view;

    this.group = new paper.Group();
    this.group.applyMatrix = false;

    this.levelRenderer = new LevelRenderer(game.level);
    this.playerRenderer = new PlayerRenderer(game.player);

    this.group.addChild(this.playerRenderer.layer);
    this.group.addChild(this.levelRenderer.layer);

    this.playerRenderer.layer.bringToFront();

    this.view.onFrame = () => {
      this.playerRenderer.onFrame();
      this.group.bounds.center = this.view.center;
    };

    game.level.addListener(LevelEvent.loaded, () => {
      setTimeout(() => {
        const { x, y } = game.player.position;
        this.playerRenderer.setPlayerPosition(x, y);
      }, 0);
    });
  }

  clear() {
    this.view.remove();
  }

  scale(scale: number) {
    this.view.scale(scale);
  }
}

const colors: Record<CellType, paper.Color> = {
  [CellType.empty]: new paper.Color('#FFF'),
  [CellType.path]: new paper.Color('#EEE'),
  [CellType.block]: new paper.Color('#CCC'),
  [CellType.player]: new paper.Color('#FFF'),
};

export class LevelRenderer {
  public layer = new paper.Layer();

  private cells = new Map<string, paper.Shape>();
  private boundaries = new paper.CompoundPath([]);

  constructor(private level: Level) {
    this.layer.name = 'level';

    level.addListener(LevelEvent.loaded, () => {
      this.init();
    });

    level.addListener(LevelEvent.completed, () => {
      this.onLevelCompleted();
    });

    level.addListener(LevelEvent.restarted, () => {
      for (const { x, y, type } of level.cells()) {
        const rect = this.cells.get(`${x},${y}`);

        if (rect) {
          rect.fillColor = colors[type];
        }
      }

      this.boundaries.strokeColor = new paper.Color('#CCC');
    });

    level.addListener(LevelEvent.cellChanged, ({ x, y, type }) => {
      const rect = this.cells.get(`${x},${y}`);

      if (rect) {
        rect.fillColor = colors[type];
      }
    });

    this.init();
  }

  private init() {
    this.layer.removeChildren();
    this.layer.activate();

    this.boundaries = new paper.CompoundPath([]);
    this.boundaries.strokeColor = new paper.Color('#CCC');
    this.boundaries.strokeWidth = 2;
    this.boundaries.strokeCap = 'round';

    const cells = this.level.cells().filter((cell) => !this.level.isEdgeBlock(cell.x, cell.y));

    for (const { x, y, type } of cells) {
      const rect = new paper.Shape.Rectangle({
        x: x * cellSize,
        y: y * cellSize,
        width: cellSize,
        height: cellSize,
      });

      rect.fillColor = colors[type];

      this.cells.set(`${x},${y}`, rect);
    }

    const path = getLevelBoundaries(cells);

    this.boundaries.moveTo([path[0].x * cellSize, path[0].y * cellSize]);

    for (const { x, y } of path) {
      this.boundaries.lineTo([x * cellSize, y * cellSize]);
    }

    this.boundaries.closePath();
  }

  private onLevelCompleted() {
    const path = this.level.cells(CellType.path);

    for (const { x, y } of path) {
      const rect = this.cells.get(`${x},${y}`);

      assert(rect);
      rect.fillColor = new paper.Color('#CFC');
    }

    this.boundaries.strokeColor = new paper.Color('#9C9');
  }
}

export class PlayerRenderer {
  public layer = new paper.Layer();

  private cell: paper.Shape;
  private target?: Point;

  private stiffness = 0.45;

  constructor(player: Player) {
    this.layer.activate();
    this.layer.name = 'player';

    this.cell = new paper.Shape.Rectangle({
      x: 0,
      y: 0,
      width: cellSize,
      height: cellSize,
    });

    this.cell.bounds.top = player.position.y * cellSize;
    this.cell.bounds.left = player.position.x * cellSize;
    this.cell.fillColor = new paper.Color('#99F');

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

  setPlayerPosition(x: number, y: number) {
    this.cell.bounds.left = x * cellSize;
    this.cell.bounds.top = y * cellSize;
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
      this.cell.bounds.left += dx * this.stiffness;
      this.cell.bounds.top += dy * this.stiffness;
    }
  }
}
