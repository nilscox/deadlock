import { Path } from './utils/direction';

export type LevelsSolutions = Record<string, LevelSolutions>;

export type LevelSolutions = {
  total: number;
  items: Array<{ complexity: number; path: Path }>;
  difficulty: number;
  numberOfSolutionsScore: number;
  easiestSolutionScore: number;
};
