import paper from 'paper';

import { useEffect, useRef, useState } from 'react';
import { Game as GameClass, GameEventType } from './game/game';
import { useLevels } from './use-levels';
import { levels as levelsData } from './game/levels';

type GameProps = {
  levelId: string;
  showLevels: () => void;
  nextLevel: () => void;
};

export const Game = ({ levelId, showLevels, nextLevel }: GameProps) => {
  const game = useRef<GameClass>();
  const [levels, setCompleted] = useLevels();

  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>();

  const tries = useRef(1);
  const startDate = useRef(new Date());

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
        const time = Math.floor((new Date().getTime() - startDate.current.getTime()) / 1000);

        setCompleted(levelId, tries.current, time);

        setTimeout(() => {
          nextLevel();
          tries.current = 1;
          startDate.current = new Date();
        }, 1000);
      }
    });

    return () => {
      game.current?.cleanup();
    };
  }, [levelId, canvas, nextLevel, setCompleted]);

  return (
    <>
      <div className="flex-1 text-lg col items-center justify-center">Level {levelId}</div>

      <canvas style={{ width: '100%', height: 400 }} ref={setCanvas} />

      <div className="flex-1 row items-end">
        <button onClick={() => showLevels()}>{'<- levels'}</button>
        <button className="ml-auto" onClick={() => navigator.clipboard.writeText(JSON.stringify(levels))}>
          copy info
        </button>
      </div>
    </>
  );
};
