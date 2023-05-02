import paper from 'paper';

import { Game as GameClass, GameEventType } from './game/game';
import { levels } from './game/levels';
import { useEffect, useRef, useState } from 'react';
import { useLevels } from './use-levels';

type GameProps = {
  levelId: string;
  showLevels: () => void;
  nextLevel: () => void;
};

export const Game = ({ levelId, showLevels, nextLevel }: GameProps) => {
  const game = useRef<GameClass>();
  const [, setCompleted] = useLevels();

  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>();

  useEffect(() => {
    if (!canvas) {
      return;
    }

    paper.setup(canvas);

    game.current = new GameClass(levels[levelId]);

    game.current.addListener(console.log);

    game.current.addListener((event) => {
      if (event.type === GameEventType.levelCompleted) {
        setCompleted(levelId);
        setTimeout(nextLevel, 1000);
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
        <button style={{ border: 'none', background: 'none' }} onClick={() => showLevels()}>
          {'<- levels'}
        </button>
      </div>
    </div>
  );
};
