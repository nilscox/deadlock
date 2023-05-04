import { LevelDescription } from './level';
import tuto from './levels/levels-tuto.json' assert { type: 'json' };
import generated from './levels/levels.json' assert { type: 'json' };

export const levels = {
  ...(tuto as Record<string, LevelDescription>),
  ...(generated as Record<string, LevelDescription>),
};
