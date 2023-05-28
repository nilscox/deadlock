import { LevelDefinition } from '@deadlock/game';
import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';

import { api } from '~/api';
import { toSearchParams, useSearchParam } from '~/hooks/use-search-params';
import { LevelEditor } from '~/level-editor/level-editor';
import { Link } from '~/components/link';
import { MobileView } from '~/mobile-view';

const defaultDefinition: LevelDefinition = {
  width: 4,
  height: 3,
  blocks: [],
  start: { x: 0, y: 0 },
  teleports: [],
};

export const LevelEditorView = () => {
  const [levelId] = useSearchParam('levelId');
  const [definitionParam, setDefinitionParam] = useSearchParam('definition');

  const definition = useMemo<LevelDefinition>(
    () => (definitionParam ? (JSON.parse(definitionParam) as LevelDefinition) : defaultDefinition),
    [definitionParam]
  );

  const setDefinition = (definition: LevelDefinition) => {
    setDefinitionParam(JSON.stringify(definition));
  };

  const { mutate: onSave } = useMutation({
    mutationKey: [definition, levelId],
    mutationFn: async () => {
      if (levelId) {
        await api.patch(`/level/${levelId}`, { definition });
      } else {
        await api.post('/level', { definition });
      }
    },
  });

  return (
    <MobileView>
      <div className="row">
        <Link href="/levels" className="row items-center gap-2">
          <div className="text-muted flip-horizontal">➜</div> Levels
        </Link>

        <button className="mx-auto" onClick={() => onSave()}>
          Save
        </button>

        <Link
          href={`/test?${toSearchParams({ levelId, definition: definitionParam })}`}
          className="row items-center gap-2"
        >
          Test <div className="text-muted">➜</div>
        </Link>
      </div>

      <LevelEditor definition={definition} onChange={setDefinition} />
    </MobileView>
  );
};
