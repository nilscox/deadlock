import { LevelDefinition, LevelFlag } from './level';

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
  effective: number;
  evaluated: number;
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
