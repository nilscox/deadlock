import { useState } from 'react';
import { Link } from 'wouter';

import { getLevelNumber } from '../use-levels';
import { useGame } from '../use-game';

type GameViewProps = {
  levelId: string;
};

export const GameView = ({ levelId }: GameViewProps) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const { onSkip } = useGame(canvas, levelId);

  return (
    <>
      <div className="flex-1 text-xl col items-center justify-center">
        <div>Level {getLevelNumber(levelId)}</div>
        <div className="text-muted text">{levelId}</div>
      </div>

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
