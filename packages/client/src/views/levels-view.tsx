import { clsx } from 'clsx';
import { Link } from 'wouter';

import { useIsLevelCompleted, useLevelNumber, useLevelsIds } from '../game/levels-context';
import { MobileView } from '../mobile-view';

export const LevelsView = () => {
  const levelsIds = useLevelsIds();

  return (
    <MobileView>
      <div className="pt-8 text-lg text-center">Levels</div>

      <div className="grid grid-cols-3 gap-4 p-4">
        {levelsIds.map((levelId) => (
          <Level key={levelId} levelId={levelId} />
        ))}
      </div>

      <Link to="/level-editor" className="py-12 text-center">
        Level editor
      </Link>
    </MobileView>
  );
};

type LevelProps = {
  levelId: string;
};

const Level = ({ levelId }: LevelProps) => {
  const levelNumber = useLevelNumber(levelId);
  const completed = useIsLevelCompleted(levelId);

  return (
    <Link
      href={`/level/${levelId}`}
      className={clsx(
        'text-sm font-semibold rounded py-4 bg-muted col justify-center items-center',
        completed && 'opacity-50'
      )}
    >
      {levelNumber}
      <div className="text-muted">{levelId}</div>
    </Link>
  );
};
