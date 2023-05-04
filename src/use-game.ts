import paper from 'paper';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Game as GameClass, GameEventType } from './game/game';
import { levels } from './game/levels';
import { useNavigate } from './hooks/use-navigate';
import { useStopwatch } from './hooks/use-stopwatch';
import { getNextLevelId, useLevels } from './use-levels';

export const useGame = (canvas: HTMLCanvasElement | null, levelId: string) => {
  const { setCompleted, setSkipped } = useLevels();
  const [game, setGame] = useState<GameClass>();

  const navigate = useNavigate();
  const nextLevel = useNextLevel(levelId);

  const tries = useRef(1);
  const stopwatch = useStopwatch();

  if (!levels[levelId]) {
    navigate('/levels');
  }

  useEffect(() => {
    tries.current = 1;
    stopwatch.restart();
    game?.setLevel(levels[levelId]);
  }, [levelId, stopwatch, game]);

  useEffect(() => {
    if (!canvas) {
      return;
    }

    paper.setup(canvas);

    const game = new GameClass();

    setGame(game);

    return () => game.cleanup();
  }, [canvas]);

  useEffect(() => {
    if (!game) {
      return;
    }

    const emitter = game.cloneEmitter();

    emitter.addListener(GameEventType.levelStarted, () => {
      tries.current++;
    });

    emitter.addListener(GameEventType.levelCompleted, () => {
      setCompleted(levelId, tries.current, stopwatch.elapsed());
      setTimeout(nextLevel, 1000);
    });

    return () => {
      emitter.removeListeners();
    };
  }, [game, levelId, setCompleted, nextLevel, stopwatch]);

  const onSkip = useCallback(() => {
    setSkipped(levelId, tries.current, stopwatch.elapsed());
    nextLevel();
  }, [setSkipped, levelId, stopwatch, nextLevel]);

  return { onSkip };
};

const useNextLevel = (levelId: string) => {
  const navigate = useNavigate();

  return useCallback(() => {
    const nextLevelId = getNextLevelId(levelId);

    if (nextLevelId) {
      navigate(`/level/${nextLevelId}`);
    } else {
      navigate('/levels');
    }
  }, [levelId, navigate]);
};
