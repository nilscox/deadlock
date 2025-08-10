import { type LevelDefinition, LevelFlag } from './level.js';

export type LevelData = {
  id: string;
  number?: number;
  flags: LevelFlag[];
  difficulty: LevelDifficulty;
  definition: LevelDefinition;
};

export type LevelSession = {
  id: string;
  levelId: string;
  date: string;
  completed: boolean;
  time: number;
  tries: number;
};

export type LevelsDifficulty = Record<string, LevelDifficulty>;

export type LevelDifficulty = {
  effective: number | null;
  evaluated: number;
};

export type LevelsStats = Record<string, LevelStats>;

export type LevelStats = {
  played: number;
  tries: null | {
    mean: number;
    min: number;
    max: number;
  };
  playTime: null | {
    mean: number;
    min: number;
    max: number;
  };
};
