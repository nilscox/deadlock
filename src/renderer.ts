import { Layer, Color, Shape, CompoundPath } from 'paper';

import { Player } from './player';
import { Cell, Level } from './level';
import { CellType, Point } from './types';

export interface Renderer {
  setLevel(level: Level): void;
  setPlayer(player: Player): void;
  update(): void;
}

export class PaperRenderer implements Renderer {
  private level!: Level;
  private player!: Player;

  private boundaries!: PaperLevelBoundaries;
  private cells = new Map<Cell, PaperCell>();
  private playerCell!: PaperCell;

  private levelLayer?: paper.Layer;
  private playerLayer?: paper.Layer;

  setLevel(level: Level): void {
    this.levelLayer?.remove();
    this.levelLayer = new Layer();
    this.levelLayer.activate();

    this.level = level;

    this.level.forEachCell((cell) => {
      this.cells.set(cell, new PaperCell(cell.type));
    });

    this.boundaries = new PaperLevelBoundaries(level);
  }

  setPlayer(player: Player) {
    this.playerLayer?.remove();
    this.playerLayer = new Layer();
    this.playerLayer.activate();

    this.player = player;
    this.playerCell = new PaperCell(CellType.player);
  }

  update() {
    this.level.forEachCell((cell) => {
      const c = this.cells.get(cell)!;

      c.type = cell.type;
      c.position = cell.position;
    });

    if (this.level.completed) {
      this.boundaries.path.strokeColor = new Color('#6C6');
    }

    this.playerCell.position = this.player.position;
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
  path = new CompoundPath([]);

  constructor(level: Level) {
    this.path.strokeColor = new Color('#CCC');

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
    this.path.moveTo([x * 40, y * 40]);

    if (direction === 'horizontal') {
      this.path.lineBy([40, 0]);
    } else {
      this.path.lineBy([0, 40]);
    }
  }
}
