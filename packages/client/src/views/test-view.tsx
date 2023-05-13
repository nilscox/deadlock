import { Level, LevelDefinition } from '@deadlock/game';
import { useMemo } from 'react';
import { Helmet } from 'react-helmet';

import { Game } from '../game/game';
import { useSearchParam } from '../hooks/use-search-params';
import { MobileView } from '../mobile-view';
import { Link } from 'wouter';

export const TestView = () => {
  const [definition] = useSearchParam('definition');
  const [hash] = useSearchParam('hash');

  const level = useMemo(() => {
    if (definition) return new Level(JSON.parse(definition) as LevelDefinition);
    if (hash) return Level.fromHash(hash);
    throw new Error('missing definition or hash query parameter');
  }, [definition, hash]);

  return (
    <MobileView>
      <Helmet>
        <title>Deadlock - Test Level</title>
      </Helmet>

      <div className="row">
        <Link to={`/level-editor?hash=${hash}`} className="row items-center gap-2">
          <div className="text-muted flip-horizontal">➜</div>Edit
        </Link>
      </div>

      <div className="flex-1 col items-center justify-center">
        <div className="text-xl">Test Level</div>
      </div>

      <div className="flex-2">
        <Game definition={level.definition} />
      </div>
    </MobileView>
  );
};
