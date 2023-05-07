import { Path } from './utils/direction';

export type LevelsSolutions = Record<string, LevelSolutions>;

export type LevelSolutions = {
  total: number;
  items: Path[];
};
