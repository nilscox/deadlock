import { clsx } from 'clsx';
import { Link } from 'wouter';

import { useIsLevelCompleted, useLevelNumber, useLevelsIds } from '../game/levels-context';
import { MobileView } from '../mobile-view';

export const LevelsView = () => {
  const levelsIds = useLevelsIds();

  const clearProgress = () => {
    if (window.confirm("You sure dude? You'll lose all your progress!")) {
      localStorage.setItem('levels', '{}');
      window.location.reload();
    }
  };

  return (
    <MobileView>
      <div className="pt-8 text-lg text-center">Levels</div>

      <div className="grid grid-cols-3 gap-4 p-4">
        {levelsIds.map((levelId) => (
          <Level key={levelId} levelId={levelId} />
        ))}
      </div>

      <button className="py-6 text-center" onClick={clearProgress}>
        Reset
      </button>

      <Link to="/level-editor" className="py-6 text-center">
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
