import clsx from 'clsx';
import { Link } from 'wouter';

import { useLevels } from '../use-levels';

export const LevelsView = () => {
  const { levels } = useLevels();

  return (
    <>
      <div className="pt-8 text-lg text-center">Levels</div>

      <div className="grid grid-cols-3 gap-4 p-4">
        {Object.entries(levels).map(([id, level], index) => (
          <Level key={id} levelId={id} levelNumber={index + 1} completed={Boolean(level?.completed)} />
        ))}
      </div>
    </>
  );
};

type LevelProps = {
  levelId: string;
  levelNumber: number;
  completed: boolean;
};

const Level = ({ levelId, levelNumber, completed }: LevelProps) => (
  <Link
    href={`/level/${levelId}`}
    className={clsx(
      'text-sm font-semibold rounded py-2 bg-muted col justify-center items-center',
      completed && 'opacity-50'
    )}
  >
    {levelNumber}
    <div className="text-muted">{levelId}</div>
  </Link>
);