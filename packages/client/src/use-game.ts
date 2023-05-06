import { useCallback, useEffect, useRef } from 'react';

import { Game, LevelEvent } from '@deadlock/game';
import { levels } from './game/levels';
import { PlayerControls } from './game/player-controls';
import { GameRenderer } from './game/renderer';
import { useNavigate } from './hooks/use-navigate';
import { useStopwatch } from './hooks/use-stopwatch';
import { getNextLevelId } from './use-levels';

type UseGameOptions = {
  scale?: number;
  onLoaded?: (game: Game) => void;
  onCompleted?: (tries: number, time: number) => void;
};

export const useGame = (
  canvas: HTMLCanvasElement | null,
  levelId: string,
  { scale, onLoaded, onCompleted }: UseGameOptions = {}
) => {
  const game = useRef<Game>();
  const renderer = useRef<GameRenderer>();

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
    game.current?.setLevel(levels[levelId]);
  }, [levelId, stopwatch]);

  useEffect(() => {
    if (!canvas) {
      return;
    }

    const controls = new PlayerControls();

    game.current = new Game(controls, levels[levelId]);
    renderer.current = new GameRenderer(canvas, game.current);

    if (scale !== undefined) {
      renderer.current.scale(scale);
    }

    const emitter = game.current.level.cloneEmitter();

    emitter.addListener(LevelEvent.restarted, () => {
      tries.current++;
    });

    emitter.addListener(LevelEvent.completed, () => {
      onCompleted?.(tries.current, stopwatch.elapsed());
    });

    onLoaded?.(game.current);

    return () => {
      emitter.removeListeners();
      controls.cleanup();
    };
  }, [canvas, scale, onLoaded]);

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
