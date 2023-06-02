import { Level, LevelDefinition } from '@deadlock/game';
import { useMemo } from 'react';
import { Redirect } from 'wouter';

import { ArrowLeft } from '~/components/arrows';
import { Translate } from '~/components/translate';
import { Game } from '~/game/game';
import { useNavigateBack } from '~/hooks/use-navigate';
import { useSearchParam } from '~/hooks/use-search-params';
import { MobileNavigation, MobileView } from '~/mobile-view';

const T = Translate.prefix('views.testLevel');

export const TestView = () => {
  const navigateBack = useNavigateBack();

  const [definition] = useSearchParam('definition');
  const [hash] = useSearchParam('hash');

  const level = useMemo(() => {
    if (definition) return new Level(JSON.parse(definition) as LevelDefinition);
    if (hash) return Level.fromHash(hash);
    throw new Error('missing definition or hash query parameter');
  }, [definition, hash]);

  if (!level) {
    return <Redirect to="/level-editor" />;
  }

  return (
    <MobileView
      header={
        <MobileNavigation
          left={
            <button onClick={navigateBack} className="row items-center gap-2">
              <ArrowLeft />
              <Translate id="navigation.home" />
            </button>
          }
        />
      }
    >
      <div className="flex-1 col items-center justify-center">
        <div className="text-xl">
          <T id="title" />
        </div>
      </div>

      <div className="flex-2">
        <Game definition={level.definition} className="mx-auto" />
      </div>
    </MobileView>
  );
};
