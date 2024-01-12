import {
  GenerateLevelsOptions,
  Level,
  LevelDefinition,
  array,
  generateLevels,
  shuffle,
} from '@deadlock/game';

import { getEntityManager } from './global';
import { insertLevel } from './insert-level';

type GenerateOptions = Pick<
  GenerateLevelsOptions,
  'width' | 'height' | 'blocks' | 'limit' | 'maxSolutions' | 'startHash'
> & {
  random?: boolean;
};

export async function generate({ random, ...options }: GenerateOptions) {
  const start = randomLevel(options.width, options.height, options.blocks);

  await generateLevels(
    {
      ...options,
      ...(random && {
        singleStartPosition: true,
        startHash: start.fingerprint,
        nextLevel: shuffle,
      }),
    },
    onProgress,
    insertLevel
  );

  await getEntityManager().flush();
}

function randomLevel(width: number, height: number, blocksCount: number) {
  const [start, t1, t2, ...blocks] = shuffle(
    array(width * height, (i) => ({ x: i % width, y: Math.floor(i / width) }))
  );

  return Level.load({
    width,
    height,
    start,
    blocks: blocks.slice(0, blocksCount),
    teleports: [t1, t2],
  });
}

async function onProgress(levels: LevelDefinition[], index: number, hasSolutions: boolean) {
  const level = levels[index];

  console.log(
    [
      //
      progress(levels.length, index),
      Level.load(level).fingerprint,
      !hasSolutions && '(no solution)',
    ]
      .filter(Boolean)
      .join(' ')
  );

  if (index % 10 === 0) {
    await getEntityManager().flush();
  }
}

function progress(total: number, index: number) {
  return `${pad(Math.floor((100 * index + 1) / total), 2)}% (${pad(index + 1, Math.log10(total))}/${total})`;
}

function pad(input: number, length: number) {
  return String(input).padStart(length, '0');
}
