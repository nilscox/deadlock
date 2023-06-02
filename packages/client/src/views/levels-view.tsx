import { clsx } from 'clsx';

import { ArrowLeft } from '~/components/arrows';
import { Link } from '~/components/link';
import { Translate } from '~/components/translate';
import { useIsLevelCompleted, useLevelNumber, useLevelsIds } from '~/game/levels-context';
import { MobileNavigation, MobileView } from '~/mobile-view';

const T = Translate.prefix('views.levels');

export const LevelsView = () => {
  const levelsIds = useLevelsIds();

  return (
    <MobileView
      header={
        <MobileNavigation
          left={
            <Link href="/" className="row gap-2 items-center">
              <ArrowLeft />
              <Translate id="navigation.home" />
            </Link>
          }
        />
      }
    >
      <div className="py-8 text-lg text-center">
        <T id="title" />
      </div>

      <div className="grid grid-cols-3 gap-4">
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
