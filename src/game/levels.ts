import { LevelDescription } from './level';
import tuto from './levels/levels-tuto.json' assert { type: 'json' };
import generated from './levels/levels.json' assert { type: 'json' };

export const levels = {
  ...tuto,
  ...generated,
} as unknown as Record<string, LevelDescription>;
