import { Game as GameClass, LevelEvent, assert } from '@deadlock/game';
import { useCallback, useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import { Link } from 'wouter';

import { Game } from '../game/game';
import {
  useLevel,
  useLevelNumber,
  useLevels,
  useNextLevelId,
  useSaveReport,
  useStoreLevelResult,
} from '../game/levels-context';
import { useNavigate } from '../hooks/use-navigate';
import { MobileView } from '../mobile-view';

type GameViewProps = {
  levelId: string;
};

export const GameView = ({ levelId }: GameViewProps) => {
  const navigate = useNavigate();
  const levels = useLevels();

  if (!levels[levelId]) {
    navigate('/levels');
  }

  const { definition } = useLevel(levelId);
  const levelNumber = useLevelNumber(levelId);

  const storeResult = useStoreLevelResult();
  const saveReport = useSaveReport();
  const nextLevel = useGoToNextLevel(levelId);

  const [game, setGame] = useState<GameClass>();

  const onChangeLevel = useCallback(
    (completed: boolean) => {
      assert(game);

      const time = game.stopwatch.elapsed;
      const tries = game.tries;

      storeResult(levelId, { completed, tries, time });
      saveReport(levelId, completed, tries, time);
    },
    [levelId, game, storeResult, saveReport]
  );

  const onCompleted = useCallback(() => {
    onChangeLevel(true);
    setTimeout(nextLevel, 1000);
  }, [onChangeLevel, nextLevel]);

  const onSkip = useCallback(() => {
    onChangeLevel(false);
    nextLevel();
  }, [onChangeLevel, nextLevel]);

  useEffect(() => {
    if (!game) {
      return;
    }

    game.level.addListener(LevelEvent.completed, onCompleted);

    return () => {
      game.level.removeListener(LevelEvent.completed, onCompleted);
    };
  }, [levelId, game, onCompleted]);

  return (
    <MobileView>
      <Helmet>
        <title>{`Deadlock - Level ${levelNumber}`}</title>
      </Helmet>

      <div className="flex-1 col items-center justify-center">
        <div className="text-xl">Level {levelNumber}</div>
        <div className="text-muted">{levelId}</div>
      </div>

      <Game definition={definition} onLoaded={setGame} />

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

const useGoToNextLevel = (levelId: string) => {
  const navigate = useNavigate();
  const nextLevelId = useNextLevelId(levelId);

  return useCallback(() => {
    if (nextLevelId) {
      navigate(`/level/${nextLevelId}`);
    } else {
      navigate('/levels');
    }
  }, [nextLevelId, navigate]);
};
