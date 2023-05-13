import { Level, LevelDefinition } from '@deadlock/game';
import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Link } from 'wouter';

import { api } from '../api';
import { useSearchParam } from '../hooks/use-search-params';
import { LevelEditor } from '../level-editor/level-editor';
import { MobileView } from '../mobile-view';

const defaultHash = '5,3B0,0;2,0;3,0;3,2S2,1';

export const LevelEditorView = () => {
  const [hash = defaultHash, setHash] = useSearchParam('hash');
  const definition = useMemo(() => Level.fromHash(hash).definition, [hash]);

  const handleChange = (definition: LevelDefinition) => {
    setHash(new Level(definition).hash);
  };

  const { mutate: onSave } = useMutation({
    mutationKey: [definition],
    mutationFn: () => api.post('/level', { definition }),
  });

  return (
    <MobileView>
      <div className="row">
        <Link to={`/levels`} className="row items-center gap-2">
          <div className="text-muted flip-horizontal">➜</div> Levels
        </Link>

        <button className="mx-auto" onClick={() => onSave()}>
          Save
        </button>

        <Link to={`/test?hash=${hash}`} className="row items-center gap-2">
          Test <div className="text-muted">➜</div>
        </Link>
      </div>

      <LevelEditor definition={definition} onChange={handleChange} />
    </MobileView>
  );
};
