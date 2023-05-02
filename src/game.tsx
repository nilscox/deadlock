import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'wouter';

import { Game as GameClass, GameEventType } from './game/game';
import { levels as levelsData } from './game/levels';
import { useLevels, useNextLevelId } from './use-levels';
import { useNavigate } from './router';

type GameProps = {
  levelId: string;
};

export const Game = ({ levelId }: GameProps) => {
  const game = useRef<GameClass>();
  const [levels, setCompleted] = useLevels();

  const nextLevelId = useNextLevelId(levelId);
  const navigate = useNavigate();

  const tries = useRef(1);
  const stopwatch = useStopwatch();

  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>();

  useEffect(() => {
    tries.current = 1;
    stopwatch.restart();
  }, [levelId, stopwatch]);

  const nextLevel = useCallback(() => {
    if (nextLevelId) {
      navigate(`/level/${nextLevelId}`);
    } else {
      navigate('/levels');
    }
  }, [nextLevelId, navigate]);

  useEffect(() => {
    if (!canvas) {
      return;
    }

    game.current = new GameClass(canvas, levelsData[levelId]);

    // game.current.addListener(console.log);

    game.current.addListener((event) => {
      if (event.type === GameEventType.levelStarted) {
        tries.current++;
      }

      if (event.type === GameEventType.levelCompleted) {
        setCompleted(levelId, tries.current, stopwatch.elapsed());
        setTimeout(nextLevel, 1000);
      }
    });

    return () => {
      game.current?.cleanup();
    };
  }, [levelId, canvas, setCompleted, nextLevel, stopwatch]);

  return (
    <>
      <div className="flex-1 text-lg col items-center justify-center">Level {levelId}</div>

      <canvas style={{ width: '100%', height: 400 }} ref={setCanvas} />

      <div className="flex-1 row items-end">
        <Link href="/levels">{'<- levels'}</Link>
        <button className="ml-auto" onClick={() => navigator.clipboard.writeText(JSON.stringify(levels))}>
          copy info
        </button>
      </div>
    </>
  );
};

const useStopwatch = () => {
  const startDate = useRef(new Date());

  const elapsed = useCallback(() => {
    const start = startDate.current.getTime();
    const end = new Date().getTime();
    const time = Math.floor(end - start);

    return time;
  }, []);

  const restart = useCallback(() => {
    startDate.current = new Date();
  }, []);

  return useMemo(
    () => ({
      elapsed,
      restart,
    }),
    [elapsed, restart]
  );
};
