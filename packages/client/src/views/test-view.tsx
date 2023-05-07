import { useCallback, useMemo, useState } from 'react';
import Helmet from 'react-helmet';
import { Link } from 'wouter';

import { Game, Level } from '@deadlock/game';
import { useSearchParam } from '../hooks/use-search-params';
import { MobileView } from '../mobile-view';
import { useGame } from '../use-game';

export const TestView = () => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  const definition = useSearchParam('definition');
  const hash = useSearchParam('hash');

  const level = useMemo(() => {
    if (definition) return new Level(JSON.parse(definition));
    if (hash) return Level.fromHash(hash);
    throw new Error('missing definition or hash query parameter');
  }, [definition, hash]);

  useGame(canvas, level.definition, {
    onLoaded: useCallback((game: Game) => {
      game.allowRestartWhenCompleted = true;
    }, []),
  });

  return (
    <MobileView>
      <Helmet>
        <title>Deadlock - Test Level</title>
      </Helmet>

      <div className="flex-1 col items-center justify-center">
        <div className="text-xl">Test Level</div>
      </div>

      <canvas style={{ width: '100%', height: 400 }} ref={setCanvas} />

      <div className="flex-1 row items-end justify-between">
        <Link href="/levels" className="row gap-2 items-center">
          <div className="text-muted flip-horizontal">➜</div> levels
        </Link>
      </div>
    </MobileView>
  );
};
