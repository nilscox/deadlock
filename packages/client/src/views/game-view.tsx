import { Game as GameClass, Level, LevelEvent, assert } from '@deadlock/game';
import { clsx } from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';

import { Game } from '../game/game';
import {
  useIsLevelCompleted,
  useLevelDefinition,
  useLevelNumber,
  useLevelsIds,
  useOnSessionTerminated,
} from '../game/levels-context';
import { useNavigate } from '../hooks/use-navigate';
import { MobileView } from '../mobile-view';

type GameViewProps = {
  levelId: string;
};

export const GameView = ({ levelId }: GameViewProps) => {
  const navigate = useNavigate();

  const definition = useLevelDefinition(levelId);
  const levelNumber = useLevelNumber(levelId);
  const completed = useIsLevelCompleted(levelId);

  const onSessionTerminated = useOnSessionTerminated(levelId);
  const prevLevel = useGoToPrevLevel(levelId);
  const nextLevel = useGoToNextLevel(levelId);

  const [game, setGame] = useState<GameClass>();

  const onCompleted = useCallback(() => {
    assert(game);
    onSessionTerminated(game, true);
    setTimeout(nextLevel, 1000);
  }, [game, onSessionTerminated, nextLevel]);

  const onSkip = useCallback(() => {
    assert(game);
    onSessionTerminated(game, false);
    nextLevel();
  }, [game, onSessionTerminated, nextLevel]);

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
        <title>{`Deadlock - Level ${String(levelNumber)}`}</title>
      </Helmet>

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

      <div className="flex-1 col justify-center text-center">
        <div
          className={clsx('transition-colors text-xl font-semibold', completed && 'text-green')}
          onDoubleClick={() => navigate(`/level-editor?hash=${new Level(definition).hash}`)}
        >
          Level {levelNumber}
        </div>
        <div className="text-muted">{levelId}</div>
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
