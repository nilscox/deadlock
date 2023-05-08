import { Game as GameClass, LevelEvent, assert } from '@deadlock/game';
import { useCallback, useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import { Link } from 'wouter';
import clsx from 'clsx';

import { Game } from '../game/game';
import {
  useLevel,
  useLevelNumber,
  useLevelsIds,
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
  const level = useLevel(levelId);

  if (!level) {
    navigate('/levels');
  }

  const { definition } = useLevel(levelId);
  const levelNumber = useLevelNumber(levelId);

  const storeResult = useStoreLevelResult();
  const saveReport = useSaveReport();
  const prevLevel = useGoToPrevLevel(levelId);
  const nextLevel = useGoToNextLevel(levelId);

  const [game, setGame] = useState<GameClass>();

  const onChangeLevel = useCallback(
    (completed: boolean) => {
      assert(game);

      const alreadyCompleted = level.completed;

      if (alreadyCompleted && !completed) {
        return;
      }

      const time = game.stopwatch.elapsed;
      const tries = game.tries;

      if (!completed && time < 2000) {
        return;
      }

      saveReport(levelId, completed, tries, time);
      storeResult(levelId, { completed, tries, time });
    },
    [levelId, level, game, storeResult, saveReport]
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
  }, [game, onCompleted]);

  useEffect(() => {
    if (!game) {
      return;
    }

    const emitter = game.level.cloneEmitter();

    emitter.addListener(LevelEvent.loaded, () => game.enableControls());
    emitter.addListener(LevelEvent.completed, () => game.disableControls());

    return () => {
      emitter.removeListeners();
    };
  }, [game]);

  return (
    <MobileView>
      <Helmet>
        <title>{`Deadlock - Level ${levelNumber}`}</title>
      </Helmet>

      <div className="flex-2 col justify-center">
        <div className="row items-end justify-between">
          <button onClick={prevLevel} className="row gap-2 items-center">
            <div className="text-muted flip-horizontal">➜</div> Back
          </button>

          <Link href="/levels" onClick={onSkip} className="row gap-2 items-center">
            Levels
          </Link>

          <button onClick={onSkip} className="row gap-2 items-center">
            Skip <div className="text-muted">➜</div>
          </button>
        </div>

        <div className="flex-1 col items-center justify-center">
          <div className={clsx('text-xl font-semibold', level.completed && 'text-green')}>
            Level {levelNumber}
          </div>
          <div className="text-muted">{levelId}</div>
        </div>
      </div>

      <Game definition={definition} onLoaded={setGame} />

      <div className="flex-1" />
    </MobileView>
  );
};

const useGoToPrevLevel = (levelId: string) => {
  const navigate = useNavigate();
  const levelsIds = useLevelsIds();
  const prevLevelId = levelsIds[levelsIds.indexOf(levelId) - 1];

  return useCallback(() => {
    if (prevLevelId) {
      navigate(`/level/${prevLevelId}`);
    } else {
      navigate('/levels');
    }
  }, [prevLevelId, navigate]);
};

const useGoToNextLevel = (levelId: string) => {
  const navigate = useNavigate();
  const levelsIds = useLevelsIds();
  const nextLevelId = levelsIds[levelsIds.indexOf(levelId) + 1];

  return useCallback(() => {
    if (nextLevelId) {
      navigate(`/level/${nextLevelId}`);
    } else {
      navigate('/levels');
    }
  }, [nextLevelId, navigate]);
};
