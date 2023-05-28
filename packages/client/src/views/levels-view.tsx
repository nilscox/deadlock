import { clsx } from 'clsx';

import { useIsLevelCompleted, useLevelNumber, useLevelsIds } from '~/game/levels-context';
import { Link } from '~/components/link';
import { MobileView } from '~/mobile-view';

export const LevelsView = () => {
  const levelsIds = useLevelsIds();

  return (
    <MobileView>
      <div className="row items-end justify-between">
        <Link href="/" className="row gap-2 items-center">
          <div className="text-muted flip-horizontal">➜</div> Home
        </Link>
      </div>

      <div className="pt-8 text-lg text-center">Levels</div>

      <div className="grid grid-cols-3 gap-4 p-4">
        {levelsIds.map((levelId) => (
          <Level key={levelId} levelId={levelId} />
        ))}
      </div>
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
