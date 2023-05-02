import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';

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
  useGame(canvas, levelId);

  return (
    <>
      <div className="flex-1 text-lg col items-center justify-center">Level {levelId}</div>

      <canvas style={{ width: '100%', height: 400 }} ref={setCanvas} />

      <div className="flex-1 row items-end">
        <Link href="/levels">{'<- levels'}</Link>
        <button
          className="ml-auto"
          onClick={() => navigator.clipboard.writeText(localStorage.getItem('levels') ?? '<no data>')}
        >
          copy info
        </button>
      </div>
    </>
  );
};

const useGame = (canvas: HTMLCanvasElement | null, levelId: string) => {
  const [, setCompleted] = useLevels();
  const [game, setGame] = useState<GameClass>();

  const navigate = useNavigate();

  const tries = useRef(1);
  const stopwatch = useStopwatch();

  useEffect(() => {
    tries.current = 1;
    stopwatch.restart();
    game?.setLevel(levelsData[levelId]);
  }, [levelId, stopwatch, game]);

  const nextLevel = useCallback(() => {
    const nextLevelId = getNextLevelId(levelId);

    if (nextLevelId) {
      navigate(`/level/${nextLevelId}`);
    } else {
      navigate('/levels');
    }
  }, [levelId, navigate]);

  useEffect(() => {
    if (!canvas) {
      return;
    }

    const game = new GameClass(canvas, levelsData[levelId]);

    setGame(game);

    return () => game.cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas]);

  useEffect(() => {
    if (!game) {
      return;
    }

    return game.addListener((event) => {
      if (event.type === GameEventType.levelStarted) {
        tries.current++;
      }

      if (event.type === GameEventType.levelCompleted) {
        setCompleted(levelId, tries.current, stopwatch.elapsed());
        setTimeout(nextLevel, 1000);
      }
    });
  }, [game, levelId, setCompleted, nextLevel, stopwatch]);
};
