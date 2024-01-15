import { GenerateLevelsOptions, generateLevels } from '@deadlock/game';

import { getEntityManager } from './global';
import { insertLevel } from './insert-level';
import { progress } from './progress';

export async function generate(options: GenerateLevelsOptions) {
  await generateLevels(options, onProgress, insertLevel);
  await getEntityManager().flush();
}

async function onProgress(total: number, index: number) {
  console.log(progress(total, index));

  if (index % 10 === 0) {
    await getEntityManager().flush();
  }
}
