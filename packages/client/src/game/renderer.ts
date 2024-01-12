import { CellType, Game, Level, LevelEvent, Player, PlayerEvent, assert } from '@deadlock/game';
import paper from 'paper';

import { ThemeMode } from '~/hooks/use-theme-mode';

import { AnimationEvent, ColorAnimation, PositionAnimation, ScaleAnimation } from './animations';
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
      this.levelRenderer.onFrame();
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

const colorsLight: Record<string, paper.Color> = {
  [CellType.empty]: new paper.Color('#FFF'),
  [CellType.path]: new paper.Color('#EEE'),
  [CellType.block]: new paper.Color('#CCC'),
  [CellType.player]: new paper.Color('#FFF'),
  [CellType.teleport]: new paper.Color('#CFF'),
  boundaries: new paper.Color('#CCC'),
  levelCompleted: new paper.Color('#CFC'),
  levelCompletedBoundaries: new paper.Color('#9C9'),
};

const colorsDark: Record<string, paper.Color> = {
  [CellType.empty]: new paper.Color('#111'),
  [CellType.path]: new paper.Color('#333'),
  [CellType.block]: new paper.Color('#666'),
  [CellType.player]: new paper.Color('#111'),
  [CellType.teleport]: new paper.Color('#6CC'),
  boundaries: new paper.Color('#666'),
  levelCompleted: new paper.Color('#363'),
  levelCompletedBoundaries: new paper.Color('#6C6'),
};

export class LevelRenderer {
  public layer = new paper.Layer();

  private cells = new Map<string, { rect: paper.Shape; animation: ColorAnimation }>();
  private boundaries = new paper.CompoundPath([]);

  public colors = document.documentElement.classList.contains(ThemeMode.dark) ? colorsDark : colorsLight;

  constructor(private level: Level) {
    this.layer.name = 'level';

    level.addListener(LevelEvent.loaded, () => {
      this.init();
    });

    level.addListener(LevelEvent.completed, () => {
      this.onLevelCompleted();
    });

    level.addListener(LevelEvent.restarted, () => {
      for (const { x, y, type } of level.map.cells()) {
        const cell = this.cells.get(`${x},${y}`);

        if (cell) {
          cell.animation.duration = 150;
          cell.animation.target = this.colors[type];

          cell.animation.once(AnimationEvent.ended, () => {
            cell.animation.duration = 0;
          });
        }
      }

      this.boundaries.strokeColor = this.colors.boundaries;
    });

    level.addListener(LevelEvent.cellChanged, ({ x, y, type }) => {
      const cell = this.cells.get(`${x},${y}`);

      if (cell) {
        cell.animation.target = this.colors[type];
      }
    });

    this.init();
  }

  private init() {
    this.layer.removeChildren();
    this.layer.activate();

    this.boundaries = new paper.CompoundPath([]);
    this.boundaries.strokeColor = this.colors.boundaries;
    this.boundaries.strokeWidth = 2;
    this.boundaries.strokeCap = 'round';

    const cells = this.level.map.cells().filter((cell) => !this.isEdgeBlock(cell.x, cell.y));

    for (const { x, y, type } of cells) {
      const rect = new paper.Shape.Rectangle({
        x: x * cellSize,
        y: y * cellSize,
        width: cellSize,
        height: cellSize,
      });

      rect.fillColor = this.colors[type];

      this.cells.set(`${x},${y}`, {
        rect,
        animation: new ColorAnimation(rect, 0),
      });
    }

    const path = getLevelBoundaries(cells);

    this.boundaries.moveTo([path[0].x * cellSize, path[0].y * cellSize]);

    for (const { x, y } of path) {
      this.boundaries.lineTo([x * cellSize, y * cellSize]);
    }

    this.boundaries.closePath();
    this.boundaries.bringToFront();
  }

  private isEdge(x: number, y: number) {
    return [
      x === 0,
      y === 0,
      x === this.level.definition.width - 1,
      y === this.level.definition.height - 1,
    ].some(Boolean);
  }

  private isEdgeBlock(x: number, y: number, visited = new Set<string>()): boolean {
    const type = this.level.map.atUnsafe(x, y);
    const key = `${x},${y}`;

    if (type !== CellType.block || visited.has(key)) {
      return false;
    }

    visited.add(key);

    if (this.isEdge(x, y)) {
      return true;
    }

    if (this.level.map.neighbors(x, y).some(({ x, y }) => this.isEdgeBlock(x, y, visited))) {
      return true;
    }

    return false;
  }

  onFrame() {
    for (const { animation } of this.cells.values()) {
      animation.frame();
    }
  }

  private onLevelCompleted() {
    const path = this.level.map.cells(CellType.path);

    for (const { x, y } of path) {
      const rect = this.cells.get(`${x},${y}`);

      assert(rect);
      rect.animation.target = this.colors.levelCompleted;
    }

    this.boundaries.strokeColor = this.colors.levelCompletedBoundaries;
  }
}

export class PlayerRenderer {
  public layer = new paper.Layer();

  private cell: paper.Shape;

  private translation: PositionAnimation;
  private scale: ScaleAnimation;

  public color = new paper.Color('#99F');

  constructor(player: Player) {
    this.layer.activate();
    this.layer.name = 'player';

    this.cell = new paper.Shape.Rectangle({
      x: 0,
      y: 0,
      width: cellSize,
      height: cellSize,
    });

    this.translation = new PositionAnimation(this.cell, 110);
    this.scale = new ScaleAnimation(this.cell, 150);

    this.cell.bounds.center.set(player.position.x * cellSize, player.position.y * cellSize);
    this.cell.translate([cellSize / 2, cellSize / 2]);
    this.cell.fillColor = this.color;

    player.addListener(PlayerEvent.moved, ({ x, y }) => {
      this.translation.target = {
        x: x * cellSize,
        y: y * cellSize,
      };
    });

    player.addListener(PlayerEvent.teleported, ({ x, y }) => {
      this.translation.once(AnimationEvent.ended, () => {
        this.scale.target = 0;

        this.scale.once(AnimationEvent.ended, () => {
          this.cell.bounds.center.set(x * cellSize, y * cellSize);
          this.cell.translate([cellSize / 2, cellSize / 2]);
          this.scale.target = 1;
        });
      });
    });

    player.addListener(PlayerEvent.reset, () => {
      this.translation.target = {
        x: player.position.x * cellSize,
        y: player.position.y * cellSize,
      };
    });
  }

  setPlayerPosition(x: number, y: number) {
    this.cell.bounds.topLeft.set(x * cellSize, y * cellSize);
  }

  onFrame() {
    this.translation?.frame();
    this.scale?.frame();
  }
}
