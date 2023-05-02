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

    paper.setup(canvas);

    game.current = new GameClass(levelsData[levelId]);

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
      paper.project.clear();

      return;
    };
  }, [levelId, canvas, nextLevel, setCompleted]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{ flex: 1, fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        Level {levelId}
      </div>

      <canvas style={{ width: '100%', height: 400 }} ref={setCanvas} />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          padding: 16,
        }}
      >
        <div>
          <button style={{ border: 'none', background: 'none' }} onClick={() => showLevels()}>
            {'<- levels'}
          </button>
          {' | '}
          <button
            style={{ border: 'none', background: 'none' }}
            onClick={() => navigator.clipboard.writeText(JSON.stringify(levels))}
          >
            copy info
          </button>
        </div>
      </div>
    </div>
  );
};
