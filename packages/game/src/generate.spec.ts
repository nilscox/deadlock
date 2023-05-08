import { nextLevel } from './generate';
import { CellType } from './level';

describe('generate', () => {
  it('single block', () => {
    expect(t('x')).toEqual(null);
  });

  it('trailing empty', () => {
    expect(t('x ')).toEqual(' x');
  });

  it('leading empty', () => {
    expect(t(' x')).toEqual(null);
  });

  it('first block', () => {
    expect(t('x  ')).toEqual(' x ');
  });

  it('middle block', () => {
    expect(t(' x ')).toEqual('  x');
  });

  it('two first blocks', () => {
    expect(t('xx ')).toEqual('x x');
  });

  it('middle empty', () => {
    expect(t('x x')).toEqual(' xx');
  });

  it('first empty', () => {
    expect(t(' xx')).toEqual(null);
  });

  it('last test', () => {
    expect(t('x xx')).toEqual(' xxx');
  });
});

const t = (input: string) => {
  const cells = input.split('').map((x) => (x === 'x' ? CellType.block : CellType.empty));

  if (nextLevel(cells) === -1) {
    return null;
  }

  return cells.map((cell) => (cell === CellType.block ? 'x' : ' ')).join('');
};

const last = <T>(array: T[]) => {
  return array[array.length - 1];
};

const next = (cells: Array<{ type: string }>) => {
  const lastBlockIdx = cells.findLastIndex(({ type }) => type === 'x');

  if (lastBlockIdx === -1) {
    return -1;
  }

  if (cells[lastBlockIdx] === last(cells)) {
    const idx = next(cells.slice(0, -1));

    if (idx === -1) {
      return -1;
    }

    if (cells[idx + 1]) {
      cells[lastBlockIdx].type = ' ';
      cells[idx + 1].type = 'x';
    }
  } else {
    cells[lastBlockIdx].type = ' ';
    cells[lastBlockIdx + 1].type = 'x';
  }

  return lastBlockIdx + 1;
};
