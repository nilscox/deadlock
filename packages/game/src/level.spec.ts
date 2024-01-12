import { CellType, Level, LevelDefinition, LevelEvent } from './level';
import { Player } from './player';
import { Direction } from './utils/direction';
import { Point } from './utils/point';

const setup = (definition?: Partial<LevelDefinition>) => {
  const level = Level.load({
    width: 1,
    height: 1,
    blocks: [],
    start: { x: 0, y: 0 },
    teleports: [],
    ...definition,
  });

  const player = new Player(level.definition.start);

  return {
    level,
    player,
  };
};

describe('Level', () => {
  it('loads a level', () => {
    const level = Level.load({
      width: 3,
      height: 1,
      blocks: [{ x: 0, y: 0 }],
      start: { x: 1, y: 0 },
      teleports: [],
    });

    expect(level.map.at(0, 0)).toBe(CellType.block);
    expect(level.map.at(1, 0)).toBe(CellType.player);
    expect(level.map.at(2, 0)).toBe(CellType.empty);
    expect(level.map.atUnsafe(3, 0)).toBeUndefined();
  });

  it('loads a new level', () => {
    const fn = vi.fn();
    const { level } = setup();

    level.addListener(LevelEvent.loaded, fn);
    level.load({ width: 2, height: 1, blocks: [], start: { x: 0, y: 0 }, teleports: [] });

    expect(level.map.at(1, 0)).toBe(CellType.empty);
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

    expect(level.map.at(1, 0)).toBe(CellType.empty);
    expect(fn).toHaveBeenCalled();
  });

  it('moves the player', () => {
    const { level, player } = setup({
      width: 3,
    });

    expect(level.movePlayer(player, Direction.right)).toEqual(true);

    expect(player.position).toEqual(new Point(1, 0));

    expect(level.map.at(0, 0)).toBe(CellType.path);
    expect(level.map.at(1, 0)).toBe(CellType.player);
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

    expect(level.map.at(0, 0)).toBe(CellType.player);
    expect(level.map.at(1, 0)).toBe(CellType.empty);
  });

  it("jumps over the player's path", () => {
    const { level, player } = setup({
      width: 3,
      start: { x: 1, y: 0 },
    });

    level.movePlayer(player, Direction.left);
    level.movePlayer(player, Direction.right);

    expect(player.position).toEqual(new Point(2, 0));

    expect(level.map.at(0, 0)).toBe(CellType.path);
    expect(level.map.at(1, 0)).toBe(CellType.path);
    expect(level.map.at(2, 0)).toBe(CellType.player);
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

  it('teleports the player to another location', () => {
    const { level, player } = setup({
      width: 3,
      blocks: [],
      teleports: [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
    });

    expect(level.movePlayer(player, Direction.right)).toEqual(true);

    expect(player.position).toEqual(new Point(2, 0));

    expect(level.map.at(0, 0)).toEqual(CellType.path);
  });

  it('teleports the player backwards', () => {
    const { level, player } = setup({
      width: 3,
      blocks: [],
      teleports: [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
      ],
    });

    expect(level.movePlayer(player, Direction.right)).toEqual(true);
    expect(level.movePlayerBack(player)).toEqual(true);

    expect(player.position).toEqual(new Point(0, 0));

    expect(level.map.at(0, 0)).toEqual(CellType.player);
    expect(level.map.at(1, 0)).toEqual(CellType.teleport);
    expect(level.map.at(1, 0)).toEqual(CellType.teleport);
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

  it("computes a level's hash", () => {
    const level = Level.load({
      width: 2,
      height: 3,
      blocks: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
      teleports: [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ],
      start: { x: 0, y: 2 },
    });

    expect(level.hash).toEqual('2,3B0,0;1,0T0,1;1,1S0,2');
  });

  it('loads a level from its hash', () => {
    const level = Level.load('2,3B0,0;1,0T0,1;1,1S0,2');

    expect(level.definition).toEqual({
      width: 2,
      height: 3,
      blocks: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
      teleports: [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ],
      start: { x: 0, y: 2 },
    });
  });

  it("computes a level's fingerprint", () => {
    const level1 = Level.load({
      width: 3,
      height: 1,
      blocks: [{ x: 0, y: 0 }],
      start: { x: 1, y: 0 },
      teleports: [],
    });

    const level2 = Level.load({
      width: 3,
      height: 1,
      blocks: [{ x: 2, y: 0 }],
      start: { x: 1, y: 0 },
      teleports: [],
    });

    expect(level1.fingerprint).toEqual(level2.fingerprint);
  });

  it("computes a level's fingerprint 2", () => {
    const level1 = Level.load('3,3B1,0S0,0');
    const level2 = Level.load(level1.fingerprint);

    expect(level1.fingerprint).toEqual(level2.fingerprint);
  });
});
