import {
  GenerateLevelsOptions,
  Level,
  LevelDefinition,
  Path,
  array,
  evaluateLevelDifficulty,
  generateLevels,
  shuffle,
} from '@deadlock/game';
import { SqlLevel, SqlSolution } from '@deadlock/persistence';
import { customAlphabet } from 'nanoid';

import { getEntityManager } from './global';

const nanoidShort = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8);
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);

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
    onGenerated
  );

  await getEntityManager().flush();
}

function randomLevel(width: number, height: number, blocksCount: number) {
  const [start, ...blocks] = shuffle(
    array(width * height, (i) => ({ x: i % width, y: Math.floor(i / width) }))
  );

  return new Level({
    width,
    height,
    start,
    blocks: blocks.slice(0, blocksCount),
  });
}

async function onProgress(levels: LevelDefinition[], index: number, hasSolutions: boolean) {
  const level = levels[index];

  console.log(
    [
      //
      progress(levels.length, index),
      Level.computeFingerprint(level),
      !hasSolutions && '(no solution)',
    ]
      .filter(Boolean)
      .join(' ')
  );

  if (index % 10 === 0) {
    await getEntityManager().flush();
  }
}

async function onGenerated(definition: LevelDefinition, paths: Path[]) {
  const em = getEntityManager();
  const level = new Level(definition);

  const {
    //
    difficulty,
    numberOfSolutionsScore,
    easiestSolutionScore,
    solutionsComplexities,
  } = evaluateLevelDifficulty(level, paths);

  const levelEntity = em.assign(new SqlLevel(), {
    id: nanoidShort(),
    fingerprint: level.fingerprint,
    difficulty,
    numberOfSolutionsScore,
    easiestSolutionScore,
    ...definition,
  });

  const solutionsEntities = paths.map((path) =>
    em.assign(new SqlSolution(), {
      id: nanoid(),
      level: levelEntity,
      complexity: solutionsComplexities?.get(path),
      path,
    })
  );

  em.persist(levelEntity);
  em.persist(solutionsEntities);
}

function progress(total: number, index: number) {
  return `${pad(Math.floor((100 * index) / total), 2)}% (${pad(index, Math.log10(total))}/${total})`;
}

function pad(input: number, length: number) {
  return String(input).padStart(length, '0');
}
