import clsx from 'clsx';
import { Link } from 'wouter';

import { useLevels } from '../use-levels';

export const Levels = () => {
  const { levels } = useLevels();

  return (
    <>
      <div className="pt-8 text-lg text-center">Levels</div>

      <div className="grid grid-cols-3 gap-4 p-4">
        {Object.entries(levels).map(([id, level]) => (
          <Level key={id} levelId={id} completed={Boolean(level?.completed)} />
        ))}
      </div>
    </>
  );
};

type LevelProps = {
  levelId: string;
  completed: boolean;
};

const Level = ({ levelId, completed }: LevelProps) => (
  <Link
    href={`/level/${levelId}`}
    className={clsx(
      'font-semibold rounded h-12 bg-neutral-100 row justify-center items-center',
      completed && 'opacity-50'
    )}
  >
    {levelId}
  </Link>
);
