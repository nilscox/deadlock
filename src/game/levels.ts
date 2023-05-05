import { LevelDescription } from './level';
import tuto from './levels/levels-tuto.json' assert { type: 'json' };
import levels_ from './levels/levels.json' assert { type: 'json' };
// import generated from '../../generated.json' assert { type: 'json' };

export const levels = {
  ...tuto,
  ...levels_,
  // ...generated,
} as unknown as Record<string, LevelDescription>;
