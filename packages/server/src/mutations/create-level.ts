import { assert, Level, LevelDefinition, evaluateLevelDifficulty, solve } from '@deadlock/game';
import { EntityManager, SqlLevel } from '@deadlock/persistence';
import { customAlphabet } from 'nanoid';

const nanoidShort = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 8);

export async function createLevel(em: EntityManager, definition: LevelDefinition) {
  const fingerprint = new Level(definition).fingerprint;
  const position = (await em.count(SqlLevel, {}, { filters: { 'not-deleted': false } })) + 1;
  const solutions = solve(definition, 512);

  assert(solutions, 'Level has too many solutions');
  assert(solutions.length > 0, 'Level has no solutions');

  const { difficulty, numberOfSolutionsScore, easiestSolutionScore } = evaluateLevelDifficulty(
    definition,
    solutions
  );

  const level = em.assign(new SqlLevel(), {
    id: nanoidShort(),
    fingerprint,
    position,
    difficulty,
    numberOfSolutionsScore,
    easiestSolutionScore,
    ...definition,
  });

  await em.persistAndFlush(level);

  return level.id;
}
