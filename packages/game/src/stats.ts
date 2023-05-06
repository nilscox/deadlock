export type LevelsStats = Record<string, LevelStats>;

export type LevelStats = {
  played: number;
  completed: number;
  skipped: number;
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