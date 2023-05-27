import { LevelDefinition, LevelFlag } from './level';
import { Path } from './utils/direction';

export type LevelData = {
  id: string;
  number?: number;
  flags: LevelFlag[];
  definition: LevelDefinition;
};

export type LevelsSolutions = Record<string, LevelSolutions>;

export type LevelSolutions = {
  total: number;
  items: Array<{ complexity: number; path: Path }>;
  effectiveDifficulty: number;
  evaluatedDifficulty: number;
};

export type LevelsStats = Record<string, LevelStats>;

export type LevelStats = {
  played: number;
  tries: {
    mean: number;
    min: number;
    max: number;
  };
  playTime: {
    mean: number;
    min: number;
    max: number;
  };
};
