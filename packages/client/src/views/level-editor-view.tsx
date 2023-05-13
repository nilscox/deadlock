import { assert, Level, LevelDefinition } from '@deadlock/game';
import { useMemo } from 'react';
import { useSearchParam } from '../hooks/use-search-params';
import { LevelEditor } from '../level-editor/level-editor';
import { MobileView } from '../mobile-view';

export const LevelEditorView = () => {
  const [hash, setHash] = useSearchParam('hash');
  assert(hash);

  const definition = useMemo(() => Level.fromHash(hash).definition, [hash]);

  const handleChange = (definition: LevelDefinition) => {
    setHash(new Level(definition).hash);
  };

  return (
    <MobileView>
      <LevelEditor definition={definition} onChange={handleChange} />
    </MobileView>
  );
};
