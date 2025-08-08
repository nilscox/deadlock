import {
  type Cell,
  CellType,
  Level,
  type LevelDefinition,
  LevelEvent,
  Player,
  PlayerEvent,
  defined,
} from '@deadlock/game';
import Two from 'two.js';
import type { Rectangle } from 'two.js/src/shapes/rectangle';
import { Vector } from 'two.js/src/vector';

import { easings, interpolate } from '../math';

import { Animation, AnimationEvent } from './animations';
import { Controls, ControlsEvent } from './controls';
import { getLevelBoundaries } from './get-level-boundaries';

export class GameRenderer {
  private static colorMap = new Map<CellType, string>([
    [CellType.empty, 'transparent'],
    [CellType.path, '#EEE'],
    [CellType.block, '#CCC'],
    [CellType.player, '#99F'],
    [CellType.teleport, '#CFF'],
  ]);

  private two = new Two({
    width: 300,
    height: 300,
    autostart: true,
  });

  private layers = {
    blocks: this.two.makeGroup(),
    teleports: this.two.makeGroup(),
    path: this.two.makeGroup(),
    player: this.two.makeGroup(),
    boundaries: this.two.makeGroup(),
  };

  private playerRect: Rectangle;

  private controls: Controls;
  private animations: Animation[];

  public readonly level: Level;
  public readonly player: Player;

  constructor(definition: LevelDefinition) {
    this.controls = new Controls();
    this.animations = [];

    this.level = Level.load(definition);
    this.player = new Player(defined(this.level.map.cells(CellType.player)[0]));
    this.playerRect = this.createCell(defined(this.level.map.cells(CellType.player)[0]));

    this.level.addListener(LevelEvent.restarted, () => {
      Object.values(this.layers).forEach((group) => {
        group.remove(group.children);
      });

      this.player.reset();
      this.init();
    });

    this.level.addListener(LevelEvent.completed, () => {
      this.layers.path.fill = '#CFC';
      this.layers.boundaries.stroke = '#0C0';
    });

    this.controls.addListener(ControlsEvent.movePlayer, ({ direction }) => {
      this.level.movePlayer(this.player, direction);
    });

    this.controls.addListener(ControlsEvent.movePlayerBack, () => {
      this.level.movePlayerBack(this.player);
    });

    this.controls.addListener(ControlsEvent.restartLevel, () => {
      if (this.animations.length === 0) {
        this.level.restart();
      }
    });

    this.player.addListener(PlayerEvent.teleported, ({ x, y }) => {
      const teleportIn = new Animation({ ease: easings.easeOutCubic });
      const teleportOut = new Animation({ ease: easings.easeInCubic });

      teleportIn.addListener(AnimationEvent.started, () => {
        // eslint-disable-next-line @typescript-eslint/no-misused-spread
        this.layers.path.add(this.createCell({ ...this.playerRect.position, type: CellType.path }));
      });

      teleportIn.addListener(AnimationEvent.update, ({ t }) => {
        this.playerRect.scale = 1 - t;
      });

      teleportOut.addListener(AnimationEvent.started, () => {
        this.playerRect.position.set(x, y);
      });

      teleportOut.addListener(AnimationEvent.update, ({ t }) => {
        this.playerRect.scale = t;
      });

      teleportOut.addListener(AnimationEvent.completed, () => {
        this.playerRect.scale = 1;
      });

      this.addAnimation(teleportIn);
      this.addAnimation(teleportOut);
    });

    this.player.addListener(PlayerEvent.moved, (target) => {
      const animation = new Animation({ ease: easings.easeOutCubic });
      const end = new Vector(target.x, target.y);
      let start = new Vector();

      animation.addListener(AnimationEvent.started, () => {
        start = this.playerRect.position.clone();

        // eslint-disable-next-line @typescript-eslint/no-misused-spread
        this.layers.path.add(this.createCell({ ...start, type: CellType.path }));
      });

      animation.addListener(AnimationEvent.update, ({ t }) => {
        this.playerRect.position.set(interpolate(start.x, end.x, t), interpolate(start.y, end.y, t));
      });

      animation.addListener(AnimationEvent.completed, () => {
        this.playerRect.position.set(end.x, end.y);
      });

      this.addAnimation(animation);
    });

    this.two.bind('update', () => this.animations[0]?.update());

    this.init();
  }

  appendTo(element: HTMLElement) {
    this.two.appendTo(element);
  }

  get domElement() {
    return this.two.renderer.domElement as HTMLElement;
  }

  init() {
    const cells = this.level.map.cells().filter((cell) => !this.isEdgeBlock(cell.x, cell.y));

    for (const [type, layer] of [
      [CellType.block, this.layers.blocks],
      [CellType.teleport, this.layers.teleports],
    ] as const) {
      cells.filter((cell) => cell.type === type).forEach((cell) => layer.add(this.createCell(cell)));
    }

    this.layers.player.add(this.playerRect);
    this.playerRect.position.set(this.player.position.x, this.player.position.y);

    const boundaries = this.two.makePath(
      getLevelBoundaries(cells).map((point) => new Two.Anchor(point.x - 0.5, point.y - 0.5)),
    );

    this.layers.boundaries.add(boundaries);

    boundaries.noFill();
    boundaries.stroke = '#666';

    this.two.scene.scale = 40;
    this.two.scene.linewidth = 1 / this.two.scene.scale;

    const rect = this.two.scene.getBoundingClientRect();

    this.two.scene.position.set(300 / 2 - rect.width / 2 + 40 / 2, 300 / 2 - rect.height / 2 + 40 / 2);
  }

  createCell(cell: Cell) {
    const rect = this.two.makeRectangle(cell.x, cell.y, 1, 1);

    rect.noStroke();
    rect.fill = defined(GameRenderer.colorMap.get(cell.type));

    return rect;
  }

  addAnimation(animation: Animation) {
    this.animations.push(animation);

    animation.once(AnimationEvent.completed, () => {
      this.animations.shift();
      this.animations[0]?.start();
    });

    if (this.animations.length === 1) {
      animation.start();
    }
  }

  isEdge(x: number, y: number) {
    return [
      x === 0,
      y === 0,
      x === this.level.definition.width - 1,
      y === this.level.definition.height - 1,
    ].some(Boolean);
  }

  isEdgeBlock(x: number, y: number, visited = new Set<string>()): boolean {
    const type = this.level.map.atUnsafe(x, y);
    const key = `${String(x)},${String(y)}`;

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

  cleanup() {
    this.level.removeListeners();
    this.player.removeListeners();
    this.controls.cleanup();
    this.two.unbind('update');
  }
}
