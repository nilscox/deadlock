import { Level } from '@deadlock/game';
import { useMemo } from 'react';
import Helmet from 'react-helmet';
import { Link } from 'wouter';

import { Game } from '../game/game';
import { useSearchParam } from '../hooks/use-search-params';
import { MobileView } from '../mobile-view';

export const TestView = () => {
  const definition = useSearchParam('definition');
  const hash = useSearchParam('hash');

  const level = useMemo(() => {
    if (definition) return new Level(JSON.parse(definition));
    if (hash) return Level.fromHash(hash);
    throw new Error('missing definition or hash query parameter');
  }, [definition, hash]);

  return (
    <MobileView>
      <Helmet>
        <title>Deadlock - Test Level</title>
      </Helmet>

      <div className="flex-1 col items-center justify-center">
        <div className="text-xl">Test Level</div>
      </div>

      <Game definition={level.definition} />

      <div className="flex-1 row items-end justify-between">
        <Link href="/levels" className="row gap-2 items-center">
          <div className="text-muted flip-horizontal">➜</div> levels
        </Link>
      </div>
    </MobileView>
  );
};
