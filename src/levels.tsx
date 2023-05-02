import clsx from 'clsx';

import { useLevels } from './use-levels';

type LevelsProps = {
  selectLevel: (id: string) => void;
};

export const Levels = ({ selectLevel }: LevelsProps) => {
  const [levels] = useLevels();

  return (
    <>
      <div className="pt-8 text-lg text-center">Levels</div>

      <div className="grid grid-cols-3 gap-4 p-4">
        {Object.entries(levels).map(([id, { completed }]) => (
          <Level key={id} id={id} completed={completed !== undefined} onClick={() => selectLevel(id)} />
        ))}
      </div>
    </>
  );
};

type LevelProps = {
  id: string;
  completed: boolean;
  onClick: () => void;
};

const Level = ({ id, completed, onClick }: LevelProps) => {
  return (
    <button
      className={clsx(
        'font-semibold rounded h-12 bg-neutral-100 row justify-center items-center',
        completed && 'opacity-50'
      )}
      onClick={onClick}
    >
      {id}
    </button>
  );
};
