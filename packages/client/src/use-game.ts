import { useCallback, useEffect, useRef } from 'react';

import { Game, LevelDefinition, LevelEvent } from '@deadlock/game';
import { useNextLevelId } from './game/levels-context';
import { PlayerControls } from './game/player-controls';
import { GameRenderer } from './game/renderer';
import { useNavigate } from './hooks/use-navigate';
import { useStopwatch } from './hooks/use-stopwatch';

type UseGameOptions = {
  scale?: number;
  onLoaded?: (game: Game) => void;
  onCompleted?: (tries: number, time: number) => void;
};

export const useGame = (
  canvas: HTMLCanvasElement | null,
  definition: LevelDefinition,
  { scale, onLoaded, onCompleted }: UseGameOptions = {}
) => {
  const game = useRef<Game>();
  const renderer = useRef<GameRenderer>();

  const tries = useRef(1);
  const stopwatch = useStopwatch();

  useEffect(() => {
    tries.current = 1;
    stopwatch.restart();
    game.current?.setLevel(definition);
  }, [definition, stopwatch]);

  useEffect(() => {
    if (!canvas) {
      return;
    }

    const controls = new PlayerControls();

    game.current = new Game(controls, definition);
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
  }, [canvas, definition, stopwatch, scale, onLoaded, onCompleted]);

  return {
    tries: useCallback(() => tries.current, []),
    elapsed: stopwatch.elapsed,
  };
};

export const useGoToNextLevel = (levelId: string) => {
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
