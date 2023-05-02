import paper from 'paper';

import { Game as GameClass, GameEventType } from './game/game';
import { levels } from './game/levels';
import { useRef } from 'react';

type GameProps = {
  levelId: string;
  showLevels: () => void;
  nextLevel: () => void;
};

export const Game = ({ levelId, showLevels, nextLevel }: GameProps) => {
  const game = useRef<GameClass>();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{ flex: 1, fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        Level {levelId}
      </div>

      <canvas
        style={{ width: '100%', height: 400 }}
        ref={(ref) => {
          if (!ref) {
            game.current?.cleanup();
            paper.project.clear();
            return;
          }

          paper.setup(ref);

          game.current = new GameClass(levels[levelId]);

          game.current.addListener(console.log);

          game.current.addListener((event) => {
            if (event.type === GameEventType.levelCompleted) {
              setTimeout(nextLevel, 1000);
            }
          });
        }}
      />

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
