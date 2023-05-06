import { useCallback, useState } from 'react';
import { Link } from 'wouter';
import Helmet from 'react-helmet';

import { useGame, useGoToNextLevel } from '../use-game';
import { MobileView } from '../mobile-view';
import { useLevelNumber, useLevels, useSaveReport, useStoreLevelResult } from '../game/levels-context';
import { useNavigate } from '../hooks/use-navigate';

type GameViewProps = {
  levelId: string;
};

export const GameView = ({ levelId }: GameViewProps) => {
  const navigate = useNavigate();
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const levels = useLevels();

  if (!levels[levelId]) {
    navigate('/levels');
  }

  const levelNumber = useLevelNumber(levelId);
  const storeResult = useStoreLevelResult();
  const saveReport = useSaveReport();

  const nextLevel = useGoToNextLevel(levelId);

  const onCompleted = useCallback(
    (tries: number, time: number) => {
      storeResult(levelId, { completed: true, tries, time });
      saveReport(levelId, true, tries, time);
      setTimeout(nextLevel, 1000);
    },
    [levelId, storeResult, saveReport, nextLevel]
  );

  const onSkip = useCallback(
    (tries: number, time: number) => {
      storeResult(levelId, { completed: false, tries, time });
      saveReport(levelId, false, tries, time);
      nextLevel();
    },
    [levelId, storeResult, saveReport, nextLevel]
  );

  const { tries, elapsed } = useGame(canvas, levelId, { onCompleted });

  return (
    <MobileView>
      <Helmet>
        <title>{`Deadlock - Level ${levelNumber}`}</title>
      </Helmet>

      <div className="flex-1 col items-center justify-center">
        <div className="text-xl">Level {levelNumber}</div>
        <div className="text-muted">{levelId}</div>
      </div>

      <canvas style={{ width: '100%', height: 400 }} ref={setCanvas} />

      <div className="flex-1 row items-end justify-between">
        <Link href="/levels" onClick={() => onSkip(tries(), elapsed())} className="row gap-2 items-center">
          <div className="text-muted flip-horizontal">➜</div> levels
        </Link>

        <button onClick={() => onSkip(tries(), elapsed())} className="row gap-2 items-center ml-auto">
          skip <div className="text-muted">➜</div>
        </button>
      </div>
    </MobileView>
  );
};
