import { useCallback, useState } from 'react';
import { Link } from 'wouter';
import Helmet from 'react-helmet';

import { getLevelNumber, useLevels } from '../use-levels';
import { useGame, useGoToNextLevel } from '../use-game';
import { MobileView } from '../mobile-view';

type GameViewProps = {
  levelId: string;
};

export const GameView = ({ levelId }: GameViewProps) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  const { setCompleted, setSkipped } = useLevels();

  const nextLevel = useGoToNextLevel(levelId);

  const onCompleted = () => {
    setCompleted(levelId, tries(), elapsed());
    setTimeout(nextLevel, 1000);
  };

  const { tries, elapsed } = useGame(canvas, levelId, { onCompleted });

  const onSkip = useCallback(() => {
    setSkipped(levelId, tries(), elapsed());
    nextLevel();
  }, [setSkipped, levelId, nextLevel, tries, elapsed]);

  return (
    <MobileView>
      <Helmet>
        <title>{`Deadlock - Level ${getLevelNumber(levelId)}`}</title>
      </Helmet>

      <div className="flex-1 col items-center justify-center">
        <div className="text-xl">Level {getLevelNumber(levelId)}</div>
        <div className="text-muted">{levelId}</div>
      </div>

      <canvas style={{ width: '100%', height: 400 }} ref={setCanvas} />

      <div className="flex-1 row items-end justify-between">
        <Link href="/levels" onClick={onSkip} className="row gap-2 items-center">
          <div className="text-muted flip-horizontal">➜</div> levels
        </Link>

        <button onClick={onSkip} className="row gap-2 items-center ml-auto">
          skip <div className="text-muted">➜</div>
        </button>
      </div>
    </MobileView>
  );
};
