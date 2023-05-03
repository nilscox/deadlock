import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import paper from 'paper';

import { Game as GameClass, GameEventType } from '../game/game';
import { levels as levelsData } from '../game/levels';
import { useNavigate } from '../hooks/use-navigate';
import { useStopwatch } from '../hooks/use-stopwatch';
import { getNextLevelId, useLevels } from '../use-levels';

type GameProps = {
  levelId: string;
};

export const Game = ({ levelId }: GameProps) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  const { onSkip } = useGame(canvas, levelId);

  return (
    <>
      <div className="flex-1 text-lg col items-center justify-center">Level {levelId}</div>

      <canvas style={{ width: '100%', height: 400 }} ref={setCanvas} />

      <div className="flex-1 row items-end justify-between">
        <Link href="/levels">{'<- levels'}</Link>

        <button
          className="ml-auto"
          onClick={() => navigator.clipboard.writeText(localStorage.getItem('levels') ?? '<no data>')}
        >
          copy info
        </button>

        <button className="ml-auto" onClick={onSkip}>
          {'-> skip'}
        </button>
      </div>
    </>
  );
};

const useGame = (canvas: HTMLCanvasElement | null, levelId: string) => {
  const { setCompleted, setSkipped } = useLevels();
  const [game, setGame] = useState<GameClass>();

  const navigate = useNavigate();
  const nextLevel = useNextLevel(levelId);

  const tries = useRef(1);
  const stopwatch = useStopwatch();

  if (!levelsData[levelId]) {
    navigate('/levels');
  }

  useEffect(() => {
    tries.current = 1;
    stopwatch.restart();
    game?.setLevel(levelsData[levelId]);
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
