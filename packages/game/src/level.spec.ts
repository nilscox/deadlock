import { CellType, Level, LevelDefinition, LevelEvent } from './level';
import { Player } from './player';
import { Direction } from './utils/direction';
import { Point } from './utils/point';

const setup = (definition?: Partial<LevelDefinition>) => {
  const level = new Level({
    width: 1,
    height: 1,
    blocks: [],
    start: { x: 0, y: 0 },
    ...definition,
  });

  const player = new Player(level.start);

  return {
    level,
    player,
  };
};

describe('Level', () => {
  it('loads a level', () => {
    const level = new Level({
      width: 3,
      height: 1,
      blocks: [{ x: 0, y: 0 }],
      start: { x: 1, y: 0 },
    });

    expect(level.at(0, 0)).toBe(CellType.block);
    expect(level.at(1, 0)).toBe(CellType.player);
    expect(level.at(2, 0)).toBe(CellType.empty);
    expect(level.atUnsafe(3, 0)).toBeUndefined();
  });

  it('loads a new level', () => {
    const fn = vi.fn();
    const { level } = setup();

    level.addListener(LevelEvent.loaded, fn);
    level.load({ width: 2, height: 1, blocks: [], start: { x: 0, y: 0 } });

    expect(level.at(1, 0)).toBe(CellType.empty);
    expect(fn).toHaveBeenCalled();
  });

  it('restarts a level', () => {
    const fn = vi.fn();
    const { level, player } = setup({
      width: 2,
    });

    level.addListener(LevelEvent.restarted, fn);

    level.movePlayer(player, Direction.right);
    level.restart();

    expect(level.at(1, 0)).toBe(CellType.empty);
    expect(fn).toHaveBeenCalled();
  });

  it('moves the player', () => {
    const { level, player } = setup({
      width: 3,
    });

    expect(level.movePlayer(player, Direction.right)).toEqual(true);

    expect(player.position).toEqual(new Point(1, 0));

    expect(level.at(0, 0)).toBe(CellType.path);
    expect(level.at(1, 0)).toBe(CellType.player);
  });

  it('emits events when a cell changes', () => {
    const fn = vi.fn();
    const { level, player } = setup({
      width: 3,
    });

    level.addListener(LevelEvent.cellChanged, fn);
    level.movePlayer(player, Direction.right);

    expect(fn).toBeCalledWith({ x: 0, y: 0, type: CellType.path });
    expect(fn).toBeCalledWith({ x: 1, y: 0, type: CellType.player });
  });

  it('moves the player backwards', () => {
    const { level, player } = setup({
      width: 2,
    });

    level.movePlayer(player, Direction.right);
    expect(level.movePlayerBack(player)).toEqual(true);
    expect(level.movePlayerBack(player)).toEqual(false);

    expect(player.position).toEqual(new Point(0, 0));

    expect(level.at(0, 0)).toBe(CellType.player);
    expect(level.at(1, 0)).toBe(CellType.empty);
  });

  it("jumps over the player's path", () => {
    const { level, player } = setup({
      width: 3,
      start: { x: 1, y: 0 },
    });

    level.movePlayer(player, Direction.left);
    level.movePlayer(player, Direction.right);

    expect(player.position).toEqual(new Point(2, 0));

    expect(level.at(0, 0)).toBe(CellType.path);
    expect(level.at(1, 0)).toBe(CellType.path);
    expect(level.at(2, 0)).toBe(CellType.player);
  });

  it('does not move when there is no cell', () => {
    const { level, player } = setup();

    expect(level.movePlayer(player, Direction.right)).toEqual(false);

    expect(player.position).toEqual(new Point(0, 0));
  });

  it('does not move when there is a block', () => {
    const { level, player } = setup({
      width: 3,
      blocks: [{ x: 1, y: 0 }],
    });

    expect(level.movePlayer(player, Direction.right)).toEqual(false);

    expect(player.position).toEqual(new Point(0, 0));
  });

  it('emits an event when the level is completed', () => {
    const fn = vi.fn();
    const { level, player } = setup({
      width: 3,
    });

    level.addListener(LevelEvent.completed, fn);

    level.movePlayer(player, Direction.right);
    expect(fn).not.toHaveBeenCalled();

    level.movePlayer(player, Direction.right);
    expect(fn).toHaveBeenCalled();
  });
});
