import { useCallback, useEffect, useRef, useState } from 'react';

import { Game as GameClass, GameEventType } from './game/game';
import { levels } from './game/levels';
import { useNavigate } from './hooks/use-navigate';
import { useStopwatch } from './hooks/use-stopwatch';
import { getNextLevelId } from './use-levels';

type UseGameOptions = {
  scale?: number;
  onCompleted?: (tries: number, time: number) => void;
};

export const useGame = (
  canvas: HTMLCanvasElement | null,
  levelId: string,
  { scale, onCompleted }: UseGameOptions = {}
) => {
  const [game, setGame] = useState<GameClass>();

  const navigate = useNavigate();
  const nextLevel = useGoToNextLevel(levelId);

  const tries = useRef(1);
  const stopwatch = useStopwatch();

  useEffect(() => {
    if (!levels[levelId]) {
      navigate('/levels');
    }
  }, [levelId, navigate]);

  useEffect(() => {
    tries.current = 1;
    stopwatch.restart();
    game?.setLevel(levels[levelId]);
  }, [levelId, stopwatch, game]);

  useEffect(() => {
    if (!canvas) {
      return;
    }

    const game = new GameClass(canvas);

    setGame(game);

    return () => game.cleanup();
  }, [canvas]);

  useEffect(() => {
    if (game && scale !== undefined) {
      game.scale(scale);
    }
  }, [game, scale]);

  useEffect(() => {
    if (!game) {
      return;
    }

    const emitter = game.cloneEmitter();

    emitter.addListener(GameEventType.levelStarted, () => {
      tries.current++;
    });

    emitter.addListener(GameEventType.levelCompleted, () => {
      onCompleted?.(tries.current, stopwatch.elapsed());
    });

    return () => {
      emitter.removeListeners();
    };
  }, [game, levelId, onCompleted, nextLevel, stopwatch]);

  return {
    tries: useCallback(() => tries.current, []),
    elapsed: stopwatch.elapsed,
  };
};

export const useGoToNextLevel = (levelId: string) => {
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
